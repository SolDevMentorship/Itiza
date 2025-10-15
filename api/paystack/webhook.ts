// src/api/paystack/webhook.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import crypto from "crypto";

/**
 * Important: Vercel needs the raw body so we can verify Paystack's HMAC signature.
 * Disable bodyParser for this route.
 */
export const config = { api: { bodyParser: false } };

function now() {
  return new Date().toISOString();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
  const INTERNAL_API_BASE = (process.env.INTERNAL_API_BASE || process.env.VITE_API_URL || "https://itiza-backend.vercel.app").replace(/\/$/, "");

  try {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    const signature = String(req.headers["x-paystack-signature"] || "");
    // Read raw body
    const raw = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on("end", () => resolve(Buffer.concat(chunks as readonly Uint8Array[])));
      req.on("error", (err) => reject(err));
    });

    // Verify signature
    const expected = crypto.createHmac("sha512", PAYSTACK_SECRET).update(raw.toString("utf8")).digest("hex");
    if (!signature || signature !== expected) {
      console.warn(`[${now()}] paystack.webhook invalid signature`, { signature, expected: expected.slice(0, 8) + "..." });
      res.status(401).send("invalid signature");
      return;
    }

    // Parse payload
    let payload: any;
    try {
      payload = JSON.parse(raw.toString("utf8"));
    } catch (e) {
      console.error(`[${now()}] paystack.webhook parse error`, e);
      res.status(400).send("invalid payload");
      return;
    }

    const evt = String(payload.event || "");
    const data = payload.data ?? {};
    const reference = String(data.reference ?? "");
    const status = String(data.status ?? "").toLowerCase();

    console.log(`[${now()}] paystack.webhook event=${evt} reference=${reference} status=${status}`);

    // Only act on successful transactions (idempotent save)
    if (status === "success") {
      // Extract metadata that your frontend passed on initialize (defensive defaults)
      const meta = data.metadata || {};
      const orderPayload = {
        trackingID: reference,
        customerID: meta.customerID ?? meta.userID ?? null,
        merchantID: meta.merchantID ?? null,
        giftID: meta.giftID ? Number(meta.giftID) : null,
        paymentMethod: "paystack_card",
        // Try originalAmount (USD) first; Paystack amount is in kobo (amount/100) and currency in data.currency
        amount: meta.originalAmount ?? (data.amount ? Number(data.amount) / 100 : null),
        networkFee: meta.networkFee ?? null,
        recipientName: meta.recipientName ?? null,
        recipientStreet: meta.recipientStreet ?? null,
        recipientCity: meta.recipientCity ?? null,
        recipientState: meta.recipientState ?? null,
        recipientCountry: meta.recipientCountry ?? null,
        giftMessage: meta.giftMessage ?? null,
        quantity: meta.quantity ?? null,
        gift: meta.gift ?? null,
        status: "paid",
        recipientPhone: meta.recipientPhone ?? null,
        senderWallet: null,
      };

      try {
        // Attempt to save order by calling your internal order API.
        // IMPORTANT: make your API handle idempotency (unique index on trackingID or check before insert).
        const saveResp = await fetch(`${INTERNAL_API_BASE}/api/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        if (!saveResp.ok) {
          const text = await saveResp.text().catch(() => "<no-body>");
          console.error(`[${now()}] paystack.webhook order save failed`, { status: saveResp.status, body: text });
        } else {
          console.log(`[${now()}] paystack.webhook order saved successfully for ${reference}`);
        }
      } catch (e) {
        console.error(`[${now()}] paystack.webhook internal save error`, e);
      }
    } else {
      console.log(`[${now()}] paystack.webhook ignoring non-success status for ${reference}`);
    }

    // Always respond 200 quickly to acknowledge webhook delivery
    res.status(200).send("ok");
  } catch (err: any) {
    console.error(`[${now()}] paystack.webhook thrown`, err);
    res.status(500).send("internal error");
  }
}
