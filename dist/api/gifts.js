"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = require("./supabaseClient");
/**
 * Vercel Node handler for GET /gifts
 * - Uses Vercel types for req/res
 * - Adds CORS headers and preflight handling
 *
 * NOTE: All Supabase logic and mapping are left exactly the same as your original module.
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
        console.log("📥 [Gifts API] Incoming GET /gifts request");
        const supabase = (0, supabaseClient_1.getSupabase)();
        if (!supabase) {
            console.error("❌ Supabase client not initialized");
            return res.status(500).json({ error: "Supabase client not initialized" });
        }
        const { data, error } = await supabase
            .from("gifts")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            console.error("❌ Supabase query error:", error);
            return res.status(500).json({ error: "Failed to fetch gifts from database" });
        }
        if (!data) {
            console.warn("⚠️ Supabase returned null for gifts");
            return res.status(200).json([]);
        }
        if (data.length === 0) {
            console.warn("⚠️ Supabase returned an empty gifts array");
            return res.status(200).json([]);
        }
        console.log(`🎁 Raw Supabase data (${data.length} rows):`, JSON.stringify(data, null, 2));
        // Map DB rows to a consistent response shape
        const response = (data || [])
            .map((row) => {
            try {
                const r = row;
                return {
                    id: r.giftID,
                    merchantID: r.merchantID ?? null,
                    name: r.name,
                    price: typeof r.price === "string" ? Number(r.price) : r.price,
                    stockQuantity: r.stockQuantity,
                    description: r.description ?? "",
                    img: r.img ?? "",
                    created_at: r.created_at ?? null,
                };
            }
            catch (mapErr) {
                console.error("❌ Error mapping gift row:", mapErr, "Row:", row);
                return null;
            }
        })
            .filter(Boolean);
        console.log("✅ Final mapped gifts response:", JSON.stringify(response, null, 2));
        return res.status(200).json(response);
    }
    catch (err) {
        console.error("💥 Unexpected error in /gifts:", err);
        return res.status(500).json({ error: "Unexpected server error while fetching gifts" });
    }
}
exports.default = handler;
//# sourceMappingURL=gifts.js.map