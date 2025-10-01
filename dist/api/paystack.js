"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const PAYSTACK_BASE = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_PUBLIC_KEY = process.env.VITE_PAYSTACK_PUBLIC_KEY || "";
const REDIRECT_URL = process.env.PAYSTACK_REDIRECT_URL || "";
function now() {
    return new Date().toISOString();
}
/**
 * Helper: decide allowed origin header value from ALLOWED_ORIGINS env.
 * If ALLOWED_ORIGINS contains "*", returns "*" (no credentials allowed).
 * If it contains the incoming origin, returns that origin and allows credentials.
 * Otherwise returns empty string (no CORS headers set).
 */
function determineAllowOrigin(originHeader) {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const origin = String(originHeader || "");
    if (allowedOrigins.includes(origin))
        return origin;
    if (allowedOrigins.includes("*"))
        return "*";
    return "";
}
async function handler(req, res) {
    // --- CORS headers + preflight handling (same pattern used across your APIs) ---
    const allowOriginHeader = determineAllowOrigin(req.headers.origin);
    if (allowOriginHeader) {
        res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
        if (allowOriginHeader !== "*") {
            // allow credentials (cookies) when a specific origin is allowed
            res.setHeader("Access-Control-Allow-Credentials", "true");
        }
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }
    // --- logging middleware equivalent (kept same info as original) ---
    try {
        console.log(`[${now()}] paystack: incoming ${req.method} ${req.url}`);
        console.log(`[${now()}] paystack: headers:`, {
            origin: req.headers.origin,
            host: req.headers.host,
            "content-type": req.headers["content-type"],
            // do NOT print authorization headers from client (if any)
        });
        if (req.body && Object.keys(req.body).length) {
            try {
                console.log(`[${now()}] paystack: body:`, JSON.stringify(req.body));
            }
            catch {
                console.log(`[${now()}] paystack: body <non-serializable>`);
            }
        }
    }
    catch (e) {
        // never throw from logging
        console.warn(`[${now()}] paystack: logging failed`, e);
    }
    // Determine route by pathname — Vercel function will typically be mounted at /api/paystack
    const host = req.headers.host ?? "localhost";
    const fullUrl = new URL(req.url ?? "/", `https://${host}`);
    const pathname = fullUrl.pathname; // e.g. /api/paystack/initialize
    // Simple helper to check paths (supports both /api/paystack/initialize and /initialize)
    const pathEndsWith = (p) => pathname.endsWith(p) || pathname.endsWith(`${p}/`) || pathname === p;
    try {
        // --------------------------
        // POST /initialize
        // --------------------------
        if (req.method === "POST" && pathEndsWith("/initialize")) {
            console.log("initialize router successfully hit");
            const start = Date.now();
            try {
                const { amount, email, currency = "USD", fullName, metadata } = req.body ?? {};
                console.log(`[${now()}] paystack.initialize called -> amount=${amount} email=${email} currency=${currency}`);
                if (!amount || !email) {
                    console.warn(`[${now()}] paystack.initialize missing amount/email`);
                    return res
                        .status(400)
                        .json({ success: false, error: "Missing or invalid amount/email" });
                }
                const amountSubunits = Math.round(Number(amount) * 100);
                // Masked env debug
                console.log(`[${now()}] paystack: PAYSTACK_BASE=${PAYSTACK_BASE}`);
                console.log(`[${now()}] paystack: PAYSTACK_SECRET_KEY ${PAYSTACK_SECRET ? "(present)" : "(missing)"}`);
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
                const payload = {
                    email,
                    amount: amountSubunits,
                    currency,
                    metadata: {
                        ...(metadata || {}),
                        customer_name: fullName || undefined,
                    },
                };
                if (REDIRECT_URL)
                    payload.redirect_url = REDIRECT_URL;
                console.log(`[${now()}] paystack -> POST ${PAYSTACK_BASE}/transaction/initialize payload:`, JSON.stringify(payload));
                const resp = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET}`,
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(payload),
                });
                // read as text first (so we can log raw body if JSON parse fails)
                const respText = await resp.text().catch((e) => {
                    console.error(`[${now()}] paystack: failed to read response text:`, e);
                    return null;
                });
                let json = null;
                try {
                    if (respText)
                        json = JSON.parse(respText);
                }
                catch (e) {
                    console.warn(`[${now()}] paystack: response is not JSON (raw text below). parse error:`, e);
                }
                console.log(`[${now()}] paystack: Paystack responded status=${resp.status} json=${json ? JSON.stringify(json) : "<not-json>"} rawText=${respText ? respText.slice(0, 2000) : "<empty>"}`);
                if (!resp.ok) {
                    // expose useful debug to caller
                    return res.status(resp.status).json({
                        success: false,
                        error: "Paystack initialize failed",
                        status: resp.status,
                        details: json ?? respText,
                    });
                }
                return res.status(200).json({ success: true, data: json?.data ?? null });
            }
            catch (err) {
                console.error(`[${now()}] paystack.initialize thrown:`, err);
                return res
                    .status(500)
                    .json({ success: false, error: "Internal server error", details: String(err) });
            }
            finally {
                console.log(`[${now()}] paystack.initialize completed in ${Date.now() - start}ms`);
            }
        }
        // --------------------------
        // GET /verify?reference=xxx
        // --------------------------
        if (req.method === "GET" && pathEndsWith("/verify")) {
            try {
                const reference = String(req.query.reference ?? "").trim();
                console.log(`[${now()}] paystack.verify called reference=${reference}`);
                if (!reference)
                    return res.status(400).json({ success: false, error: "Missing reference" });
                if (!PAYSTACK_SECRET) {
                    console.warn(`[${now()}] PAYSTACK_SECRET_KEY not set — mock verify`);
                    if (reference.startsWith("MOCK_REF_")) {
                        return res.json({ success: true, data: { status: "success", reference } });
                    }
                    return res.status(404).json({ success: false, error: "Mock verify: not found" });
                }
                console.log(`[${now()}] paystack -> GET ${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`);
                const resp = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${PAYSTACK_SECRET}`,
                        Accept: "application/json",
                    },
                });
                const respText = await resp.text().catch((e) => {
                    console.error(`[${now()}] paystack.verify failed to read text:`, e);
                    return null;
                });
                let json = null;
                try {
                    if (respText)
                        json = JSON.parse(respText);
                }
                catch (e) {
                    console.warn(`[${now()}] paystack.verify response not JSON parseable:`, e);
                }
                console.log(`[${now()}] paystack.verify status=${resp.status} body=${json ? JSON.stringify(json) : respText}`);
                if (!resp.ok) {
                    return res
                        .status(resp.status)
                        .json({ success: false, error: "Paystack verify failed", details: json ?? respText });
                }
                return res.json({ success: true, data: json.data });
            }
            catch (err) {
                console.error(`[${now()}] paystack.verify thrown:`, err);
                return res
                    .status(500)
                    .json({ success: false, error: "Internal server error", details: String(err) });
            }
        }
        // --------------------------
        // GET /config
        // --------------------------
        if (req.method === "GET" && pathEndsWith("/config")) {
            console.log(`[${now()}] paystack.config called`);
            if (!PAYSTACK_PUBLIC_KEY) {
                console.warn(`[${now()}] PAYSTACK_PUBLIC_KEY not set`);
                return res.status(500).json({
                    success: false,
                    error: "Paystack public key not configured",
                });
            }
            return res.json({
                success: true,
                data: {
                    publicKey: PAYSTACK_PUBLIC_KEY,
                    currency: "NGN",
                },
            });
        }
        // --------------------------
        // GET /test
        // --------------------------
        if (req.method === "GET" && pathEndsWith("/test")) {
            console.log("Paystack test route hit!");
            return res.json({
                message: "Paystack router is working!",
                timestamp: new Date().toISOString(),
                baseUrl: fullUrl.origin,
                originalUrl: req.url,
            });
        }
        // If no route matched:
        return res.status(404).json({ success: false, error: "Not found" });
    }
    catch (err) {
        console.error(`[${now()}] paystack.handler thrown:`, err);
        return res.status(500).json({ success: false, error: "Internal server error", details: String(err) });
    }
}
exports.default = handler;
//# sourceMappingURL=paystack.js.map