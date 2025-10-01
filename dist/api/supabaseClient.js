"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSupabase = exports.connectToSupabase = exports.initSupabase = void 0;
// src/supabaseClient.ts
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
if (!SUPABASE_URL || !SUPABASE_API_KEY) {
    throw new Error("SUPABASE_URL and SUPABASE_API_KEY environment variables must be defined");
}
let supabase = null;
function initSupabase() {
    if (!supabase) {
        supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_API_KEY);
        console.log("Supabase client initialized");
    }
    return supabase;
}
exports.initSupabase = initSupabase;
/**
 * Optional connectivity check. Calls a lightweight select on the customers table.
 */
async function connectToSupabase() {
    const client = initSupabase();
    try {
        // lightweight check — don't return data to avoid extra payload
        const { error } = await client.from("customers").select("customerID").limit(1).maybeSingle();
        if (error)
            throw error;
        console.log("✅ Supabase connection OK");
    }
    catch (err) {
        console.error("Supabase connection check failed:", err);
        throw err;
    }
}
exports.connectToSupabase = connectToSupabase;
function getSupabase() {
    if (!supabase) {
        return initSupabase();
    }
    return supabase;
}
exports.getSupabase = getSupabase;
//# sourceMappingURL=supabaseClient.js.map