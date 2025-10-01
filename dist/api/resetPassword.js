"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const supabaseClient_1 = require("./supabaseClient"); // adjust path if your project layout differs
dotenv_1.default.config();
console.log("[DEBUG resetPassword] module loaded at", new Date().toISOString());
/**
 * Vercel Node handler for POST /resetpassword
 * - Uses Vercel types for req/res
 * - Adds CORS headers and preflight handling
 *
 * NOTE: All Supabase logic and behavior are left unchanged.
 */
async function handler(req, res) {
    // Basic CORS - allow origins via env or fallback to wildcard
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const origin = String(req.headers.origin || "");
    const allowOriginHeader = allowedOrigins.includes(origin)
        ? origin
        : allowedOrigins.includes("*")
            ? "*"
            : "";
    if (allowOriginHeader) {
        res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
        // allow credentials (cookies) when a specific origin is allowed
        if (allowOriginHeader !== "*")
            res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400"); // cache preflight for 1 day
    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    try {
        const supabase = (0, supabaseClient_1.getSupabase)();
        const { customerID, newPassword, otp } = req.body ?? {};
        // 🔍 Debug log (temporary)
        console.log("[DEBUG] Incoming reset request:", {
            customerID,
            newPasswordLength: newPassword?.length,
            otp,
        });
        if (!customerID || !newPassword) {
            return res.status(400).json({ error: "Missing required fields: customerID and newPassword" });
        }
        // Basic password validation
        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({ error: "Password must be a string of at least 6 characters" });
        }
        const hashed = await bcryptjs_1.default.hash(newPassword, 10);
        // Update the password in the customers table (use eq on customerID)
        const { data, error } = await supabase
            .from("customers")
            .update({ password: hashed })
            .eq("customerID", customerID)
            .select();
        if (error) {
            console.error("Supabase update error (reset-password):", error);
            return res.status(500).json({ error: "Failed to update password" });
        }
        // If no rows were updated, data will be an empty array
        if (!data || (Array.isArray(data) && data.length === 0)) {
            return res.status(404).json({ error: "Customer not found" });
        }
        // Success
        return res.status(200).json({ message: "Password updated successfully" });
    }
    catch (err) {
        console.error("Unexpected error in /reset-password:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
exports.default = handler;
//# sourceMappingURL=resetPassword.js.map