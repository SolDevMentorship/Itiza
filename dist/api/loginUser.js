"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function decodeBytea(bytea) {
    if (Buffer.isBuffer(bytea)) {
        return bytea.toString("utf8");
    }
    if (typeof bytea === "string" && bytea.startsWith("\\x")) {
        return Buffer.from(bytea.slice(2), "hex").toString("utf8");
    }
    return String(bytea);
}
async function handler(req, res) {
    // ---- CORS handling (must run before any DB import/execution) ----
    const allowedOriginsEnv = (process.env.ALLOWED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    const allowedOrigins = allowedOriginsEnv;
    const origin = String(req.headers.origin || "");
    let allowOriginHeader = "";
    // Check for wildcard OR specific origin
    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        // Always use the specific origin when credentials are involved
        allowOriginHeader = origin;
    }
    if (allowOriginHeader) {
        res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    // Tell caches that the response varies by Origin
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
    // Handle preflight early (no DB imports, no side-effects)
    if (req.method === "OPTIONS") {
        return res.status(204).end();
    }
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }
    console.log("👀 Hit /loginUser with body:", req.body);
    try {
        const { customerID, password, identifier } = req.body ?? {};
        // Use either customerID or identifier (fallback)
        const userIdentifier = customerID || identifier;
        if (!userIdentifier || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        // ---- Dynamically import the supabase client here (after preflight) ----
        let getSupabase;
        try {
            ({ getSupabase } = await Promise.resolve().then(() => __importStar(require("./supabaseClient"))));
        }
        catch (impErr) {
            console.error("Failed to import supabaseClient:", impErr);
            return res.status(500).json({ error: "Server misconfiguration: database client unavailable" });
        }
        const supabase = getSupabase();
        const { data: user, error } = await supabase
            .from("customers")
            .select("*")
            .eq("customerID", String(userIdentifier).toLowerCase().trim())
            .maybeSingle();
        if (error) {
            console.error("❌ Supabase query error:", error);
            return res.status(500).json({ error: "Database error" });
        }
        if (!user || !user.password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
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
        // Cookie for cross-site usage: SameSite=None and Secure (in production)
        // NOTE: for cross-origin cookies browsers require SameSite=None AND Secure.
        const cookieParts = [
            `token=${token}`,
            `HttpOnly`,
            `Path=/`,
            `Max-Age=${60 * 60}`,
            `SameSite=None`,
        ];
        if (process.env.NODE_ENV === "production") {
            cookieParts.push("Secure");
        }
        res.setHeader("Set-Cookie", cookieParts.join("; "));
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