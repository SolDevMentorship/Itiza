// src/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

if (!SUPABASE_URL || !SUPABASE_API_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_API_KEY environment variables must be defined");
}

let supabase: SupabaseClient | null = null;

export function initSupabase() {
  if (!supabase) {
    supabase = createClient(SUPABASE_URL!, SUPABASE_API_KEY!);
    console.log("Supabase client initialized");
  }
  return supabase;
}

/**
 * Optional connectivity check. Calls a lightweight select on the customers table.
 */
export async function connectToSupabase() {
  const client = initSupabase();
  try {
    // lightweight check — don't return data to avoid extra payload
    const { error } = await client.from("customers").select("customerID").limit(1).maybeSingle();
    if (error) throw error;
    console.log("✅ Supabase connection OK");
  } catch (err) {
    console.error("Supabase connection check failed:", err);
    throw err;
  }
}

export function getSupabase() {
  if (!supabase) {
    return initSupabase();
  }
  return supabase;
}
