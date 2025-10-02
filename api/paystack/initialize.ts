// src/api/paystack/initialize.ts
import { VercelRequest, VercelResponse } from "@vercel/node";

const PAYSTACK_BASE = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const REDIRECT_URL = process.env.PAYSTACK_CALLBACK_URL
 || "";

function now() {
  return new Date().toISOString();
}

/**
 * Set CORS headers - MUST be called before any response
 */
function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  try {
    const allowedOriginsEnv = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const origin = String(req.headers.origin || "");
    let allowOriginHeader = "";

    if (allowedOriginsEnv.includes("*") || allowedOriginsEnv.includes(origin)) {
      allowOriginHeader = origin;
    }

    console.log(`[${now()}] CORS Debug:`, {
      origin,
      allowedOriginsEnv,
      allowOriginHeader,
      envRaw: process.env.ALLOWED_ORIGINS,
    });

    if (allowOriginHeader) {
      res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  } catch (err) {
    console.error(`[${now()}] CORS setup error:`, err);
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS first
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Only allow POST for initialize
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    console.log(`[${now()}] paystack.initialize incoming ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length) {
      try {
        console.log(`[${now()}] paystack.initialize body:`, JSON.stringify(req.body));
      } catch {
        console.log(`[${now()}] paystack.initialize body <non-serializable>`);
      }
    }
  } catch (e) {
    console.warn(`[${now()}] paystack.initialize logging failed`, e);
  }

  const start = Date.now();
  try {
    const { amount, email, currency = "NGN", fullName, metadata } = req.body ?? {};
    console.log(
      `[${now()}] paystack.initialize called -> amount=${amount} email=${email} currency=${currency}`
    );

    if (!amount || !email) {
      console.warn(`[${now()}] paystack.initialize missing amount/email`);
      return res.status(400).json({ success: false, error: "Missing or invalid amount/email" });
    }

    const amountSubunits = Math.round(Number(amount) * 100);

    console.log(`[${now()}] paystack: PAYSTACK_BASE=${PAYSTACK_BASE}`);
    console.log(
      `[${now()}] paystack: PAYSTACK_SECRET_KEY ${PAYSTACK_SECRET ? "(present)" : "(missing)"}`
    );

    // Mock behavior if secret not set (useful for local/dev)
    if (!PAYSTACK_SECRET) {
      console.warn(`[${now()}] PAYSTACK_SECRET_KEY not set — returning mocked initialize response`);
      return res.status(200).json({
        success: true,
        mocked: true,
        data: {
          authorization_url: `https://example.com/mock-paystack-auth?ref=MOCK_REF_${Date.now()}`,
          access_code: `MOCK_ACCESS_${Date.now()}`,
          reference: `MOCK_REF_${Date.now()}`,
        },
      });
    }

    const payload: any = {
      email,
      amount: amountSubunits,
      currency,
      metadata: {
        ...(metadata || {}),
        customer_name: fullName || undefined,
      },
    };
    if (REDIRECT_URL) payload.redirect_url = REDIRECT_URL;

    console.log(
      `[${now()}] paystack -> POST ${PAYSTACK_BASE}/transaction/initialize payload:`,
      JSON.stringify(payload)
    );

    const resp = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const respText = await resp.text().catch((e: any) => {
      console.error(`[${now()}] paystack: failed to read response text:`, e);
      return null;
    });

    let json: any = null;
    try {
      if (respText) json = JSON.parse(respText);
    } catch (e) {
      console.warn(`[${now()}] paystack: response is not JSON. parse error:`, e);
    }

    console.log(
      `[${now()}] paystack: Paystack responded status=${resp.status} json=${
        json ? JSON.stringify(json) : "<not-json>"
      } rawText=${respText ? respText.slice(0, 2000) : "<empty>"}`
    );

    if (!resp.ok) {
      return res.status(resp.status).json({
        success: false,
        error: "Paystack initialize failed",
        status: resp.status,
        details: json ?? respText,
      });
    }

    return res.status(200).json({ success: true, data: json?.data ?? null });
  } catch (err: any) {
    console.error(`[${now()}] paystack.initialize thrown:`, err);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error", details: String(err) });
  } finally {
    console.log(`[${now()}] paystack.initialize completed in ${Date.now() - start}ms`);
  }
}
