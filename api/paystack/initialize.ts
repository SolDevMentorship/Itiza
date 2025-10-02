import { VercelRequest, VercelResponse } from "@vercel/node";

const PAYSTACK_BASE = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  const allowedOriginsEnv = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const origin = String(req.headers.origin || "");
  let allowOriginHeader = "";

  if (allowedOriginsEnv.includes("*") || allowedOriginsEnv.includes(origin)) {
    allowOriginHeader = origin;
  }

  if (allowOriginHeader) {
    res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { amount, email, currency = "NGN", fullName, metadata } = req.body ?? {};

    if (!amount || !email) {
      return res.status(400).json({ success: false, error: "Missing or invalid amount/email" });
    }

    const amountSubunits = Math.round(Number(amount) * 100);

    if (!PAYSTACK_SECRET) {
      return res.status(200).json({
        success: true,
        mocked: true,
        data: {
          authorization_url: `https://example.com/mock?ref=MOCK_${Date.now()}`,
          access_code: `MOCK_${Date.now()}`,
          reference: `MOCK_${Date.now()}`,
        },
      });
    }

    const payload: any = {
      email,
      amount: amountSubunits,
      currency,
      metadata: { ...(metadata || {}), customer_name: fullName || undefined },
    };

    const resp = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({
        success: false,
        error: "Paystack initialize failed",
        details: json,
      });
    }

    return res.status(200).json({ success: true, data: json?.data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}