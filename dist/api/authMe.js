"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabaseClient_1 = require("./supabaseClient");
/**
 * Vercel Node handler for GET /auth/me
 * - Uses Vercel types for req/res
 * - Adds CORS headers and preflight handling
 *
 * NOTE: Database calls and logic are left exactly as in your original module.
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
        return res.status(405).json({ success: false, error: "Method not allowed" });
    }
    try {
        const token = req.cookies?.token ||
            (req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null);
        if (!token) {
            return res.status(401).json({ success: false, error: "Not authenticated" });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET not set");
            return res.status(500).json({ success: false, error: "Server misconfigured" });
        }
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, secret);
        }
        catch {
            return res.status(401).json({ success: false, error: "Invalid token" });
        }
        const identifier = payload?.email ?? payload?.id;
        if (!identifier) {
            return res.status(401).json({ success: false, error: "Invalid token payload" });
        }
        const supabase = (0, supabaseClient_1.getSupabase)();
        const { data: user, error } = await supabase
            .from("customers")
            .select("id, customerID, fullName, phoneNumber, created_at")
            .eq("customerID", String(identifier))
            .maybeSingle();
        if (error) {
            console.error("Supabase error in /auth/me:", error);
            return res.status(500).json({ success: false, error: "Database error" });
        }
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }
        return res.status(200).json({ success: true, user });
    }
    catch (err) {
        console.error("Error in /auth/me:", err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}
exports.default = handler;
//# sourceMappingURL=authMe.js.map