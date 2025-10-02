// src/api/paystack/verify.ts
import { VercelRequest, VercelResponse } from "@vercel/node";

const PAYSTACK_BASE = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";

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

  // Only allow GET for verify
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    console.log(`[${now()}] paystack.verify incoming ${req.method} ${req.url}`);
  } catch (e) {
    console.warn(`[${now()}] paystack.verify logging failed`, e);
  }

  try {
    const reference = String(req.query.reference ?? "").trim();
    console.log(`[${now()}] paystack.verify called reference=${reference}`);
    if (!reference) return res.status(400).json({ success: false, error: "Missing reference" });

    // Mock behavior if secret not set
    if (!PAYSTACK_SECRET) {
      console.warn(`[${now()}] PAYSTACK_SECRET_KEY not set — mock verify`);
      if (reference.startsWith("MOCK_REF_")) {
        return res.json({ success: true, data: { status: "success", reference } });
      }
      return res.status(404).json({ success: false, error: "Mock verify: not found" });
    }

    console.log(
      `[${now()}] paystack -> GET ${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`
    );
    const resp = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        Accept: "application/json",
      },
    });

    const respText = await resp.text().catch((e: any) => {
      console.error(`[${now()}] paystack.verify failed to read text:`, e);
      return null;
    });

    let json: any = null;
    try {
      if (respText) json = JSON.parse(respText);
    } catch (e) {
      console.warn(`[${now()}] paystack.verify response not JSON parseable:`, e);
    }

    console.log(
      `[${now()}] paystack.verify status=${resp.status} body=${json ? JSON.stringify(json) : respText}`
    );

    if (!resp.ok) {
      return res
        .status(resp.status)
        .json({ success: false, error: "Paystack verify failed", details: json ?? respText });
    }

    return res.json({ success: true, data: json.data });
  } catch (err: any) {
    console.error(`[${now()}] paystack.verify thrown:`, err);
    return res.status(500).json({ success: false, error: "Internal server error", details: String(err) });
  }
}
