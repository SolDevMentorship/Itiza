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
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const reference = String(req.query.reference ?? "").trim();

    if (!reference) {
      return res.status(400).json({ success: false, error: "Missing reference" });
    }

    if (!PAYSTACK_SECRET) {
      if (reference.startsWith("MOCK_")) {
        return res.json({ success: true, data: { status: "success", reference } });
      }
      return res.status(404).json({ success: false, error: "Not found" });
    }

    const resp = await fetch(
      `${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
        },
      }
    );

    const json = await resp.json();

    if (!resp.ok) {
      return res.status(resp.status).json({ success: false, error: "Verify failed", details: json });
    }

    return res.json({ success: true, data: json.data });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}