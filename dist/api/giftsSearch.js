"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = require("./supabaseClient");
const DEBUG_RAW = process.env.DEBUG_RAW === "1";
/**
 * Vercel Node handler for GET /giftsSearch
 * - Uses Vercel types for req/res
 * - Adds CORS headers and preflight handling
 *
 * NOTE: All Supabase logic is left exactly as in your original module.
 */
async function handler(req, res) {
    // Basic CORS - allow origins via env or fallback to wildcard
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
        .split(",")
        .map((s) => s.trim());
    const origin = String(req.headers.origin || "");
    const allowOriginHeader = allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins.includes("*")
            ? "*"
            : "";
    if (allowOriginHeader) {
        res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400"); // cache preflight for 1 day
    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        const q = String(req.query.q ?? "").trim();
        console.log("[DEBUG giftsSearch] incoming query:", q);
        if (!q)
            return res.status(200).json([]);
        const supabase = (0, supabaseClient_1.getSupabase)();
        if (!supabase) {
            console.error("[DEBUG giftsSearch] Supabase client not initialized");
            return res.status(500).json({ error: "Supabase client not initialized" });
        }
        const pattern = `%${q}%`;
        // Explicitly select columns that match your provided schema
        const { data, error } = await supabase
            .from("gifts")
            .select(
        // match your schema exactly:
        "giftID, created_at, merchantID, name, price, stockQuantity, description, img")
            .ilike("name", pattern)
            .limit(50);
        if (error) {
            console.error("[DEBUG giftsSearch] supabase error:", {
                message: error.message,
                details: error.details ?? null,
                hint: error.hint ?? null,
                code: error.code ?? null,
            });
            return res.status(500).json({ error: "DB error", details: error });
        }
        const rows = Array.isArray(data) ? data : [];
        const mapped = rows.map((r) => {
            // giftID is int8 (bigint) — Supabase may return as string or number depending on driver.
            // Normalize to number when possible and produce a canonical string id for the frontend.
            const giftIdNum = typeof r.giftID === "number"
                ? r.giftID
                : typeof r.giftID === "string" && /^\d+$/.test(r.giftID)
                    ? Number(r.giftID)
                    : null;
            const priceNum = typeof r.price === "number"
                ? r.price
                : r.price != null && r.price !== ""
                    ? Number(r.price)
                    : null;
            // stockQuantity is numeric — often returned as string to preserve precision.
            const stockNum = typeof r.stockQuantity === "number"
                ? r.stockQuantity
                : r.stockQuantity != null && r.stockQuantity !== ""
                    ? Number(r.stockQuantity)
                    : null;
            const mappedRow = {
                // canonical id as string for the frontend
                id: giftIdNum != null ? String(giftIdNum) : r.giftID != null ? String(r.giftID) : null,
                giftID: giftIdNum,
                created_at: r.created_at ?? null,
                merchantID: r.merchantID ?? null,
                name: r.name ?? "",
                price: priceNum,
                stockQuantity: stockNum,
                description: r.description ?? null,
                img: r.img ?? null,
            };
            if (DEBUG_RAW)
                mappedRow.raw = r;
            return mappedRow;
        });
        console.log(`[DEBUG giftsSearch] found ${mapped.length} rows for q='${q}'`);
        return res.status(200).json(mapped);
    }
    catch (err) {
        console.error("[DEBUG giftsSearch] unexpected error:", err);
        return res.status(500).json({ error: "Internal server error", details: String(err) });
    }
}
exports.default = handler;
//# sourceMappingURL=giftsSearch.js.map