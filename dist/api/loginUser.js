"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const supabaseClient_1 = require("./supabaseClient");
// ✅ Helper to decode Postgres bytea (hex or Buffer) into UTF8 string
function decodeBytea(bytea) {
    if (Buffer.isBuffer(bytea)) {
        return bytea.toString("utf8");
    }
    if (typeof bytea === "string" && bytea.startsWith("\\x")) {
        return Buffer.from(bytea.slice(2), "hex").toString("utf8");
    }
    return String(bytea);
}
/**
 * Vercel Node handler for POST /login
 * - Uses Vercel types for req/res
 * - Adds CORS headers and preflight handling
 *
 * NOTE: Database and authentication logic are left exactly as in your original module.
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
        // If we're not allowing "*", it's safe to allow credentials (cookies)
        if (allowOriginHeader !== "*") {
            res.setHeader("Access-Control-Allow-Credentials", "true");
        }
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
    console.log("👀 Hit /login with body:", req.body);
    try {
        const { customerID, password } = req.body ?? {};
        if (!customerID || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const supabase = (0, supabaseClient_1.getSupabase)();
        const { data: user, error } = await supabase
            .from("customers")
            .select("*")
            .eq("customerID", String(customerID).toLowerCase().trim())
            .maybeSingle();
        if (error) {
            console.error("❌ Supabase query error:", error);
            return res.status(500).json({ error: "Database error" });
        }
        if (!user || !user.password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // ✅ Decode stored hash
        const storedHash = decodeBytea(user.password);
        const isMatch = await bcryptjs_1.default.compare(password, storedHash);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET not set");
            return res.status(500).json({ error: "Server configuration error" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.customerID }, secret, { expiresIn: "1h" });
        // Build Set-Cookie header similar to express' res.cookie
        const cookieParts = [
            `token=${token}`,
            `HttpOnly`,
            `Path=/`,
            `Max-Age=${60 * 60}`,
            `SameSite=Strict`,
        ];
        if (process.env.NODE_ENV === "production") {
            cookieParts.push("Secure");
        }
        const cookieHeader = cookieParts.join("; ");
        // Set the cookie header (Vercel functions don't have res.cookie)
        res.setHeader("Set-Cookie", cookieHeader);
        const { password: _pw, ...safeUser } = user;
        return res.status(200).json({
            message: "Login successful",
            token,
            user: safeUser,
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
exports.default = handler;
//# sourceMappingURL=loginUser.js.map