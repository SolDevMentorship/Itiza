"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabaseClient_1 = require("./supabaseClient");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/**
 * Vercel Node handler for POST /signup
 * - Uses Vercel types for req/res
 * - Adds CORS headers and preflight handling
 *
 * NOTE: Database connection and all existing logic are unchanged.
 */
async function handler(req, res) {
    // Basic CORS - allow origins via env or fallback to wildcard
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "*")
        .split(",")
        .map((s) => s.trim());
    const origin = String(req.headers.origin || "");
    const allowOriginHeader = allowedOrigins.includes(origin) ? origin : allowedOrigins.includes("*") ? "*" : "";
    if (allowOriginHeader) {
        res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
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
    console.log("👀 Hit /signup with body:", req.body);
    try {
        const supabase = (0, supabaseClient_1.getSupabase)();
        const { fullName, email: rawEmail, password, phoneNumber, street, city, state, zipCode, country, } = req.body ?? {};
        if (!fullName || !rawEmail || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        const email = String(rawEmail).toLowerCase();
        // 1. Check if user exists (by customerID)
        const { data: existing, error: selectError } = await supabase
            .from("customers")
            .select("customerID")
            .eq("customerID", email)
            .maybeSingle();
        if (selectError) {
            console.error("Error checking existing user:", selectError);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (existing) {
            return res.status(409).json({ error: "User already exists" });
        }
        // 2. Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // 3. Build payload matching DB schema
        const insertPayload = {
            customerID: email,
            fullName,
            password: hashedPassword,
            totalOrders: 0,
            totalSpent: 0,
            phoneNumber: phoneNumber ?? null,
            street: street ?? null,
            city: city ?? null,
            state: state ?? null,
            zipCode: zipCode ?? null,
            country: country ?? null,
            created_at: new Date().toISOString(),
        };
        // 4. Insert into customers table
        const { data: inserted, error: insertError } = await supabase
            .from("customers")
            .insert([insertPayload])
            .select()
            .single();
        if (insertError) {
            const msg = String(insertError.message || "");
            const code = String(insertError.code || "");
            if (code === "23505" ||
                msg.toLowerCase().includes("duplicate") ||
                msg.toLowerCase().includes("unique")) {
                return res.status(409).json({ error: "User already exists" });
            }
            console.error("Signup insert error:", insertError);
            return res.status(500).json({ error: "Internal server error" });
        }
        return res.status(201).json({ message: "User created", user: inserted });
    }
    catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}
exports.default = handler;
//# sourceMappingURL=auth.js.map