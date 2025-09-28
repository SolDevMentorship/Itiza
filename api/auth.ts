// src/api/signup.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabase } from "./supabaseClient";
import bcrypt from "bcryptjs";

/**
 * Types
 */
export interface Customer {
  id: number;
  customerID: string;
  fullName: string;
  password: string; // bcrypt hash string
  totalOrders: number | string | null;
  totalSpent: number | string | null;
  phoneNumber: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  created_at: string;
}

export type NewCustomer = Omit<Customer, "id">;

/**
 * Vercel Node handler for POST /signup
 * - Uses Vercel types for req/res
 * - Adds CORS headers and preflight handling
 *
 * NOTE: Database connection and all existing logic are unchanged.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    const supabase = getSupabase();
    const {
      fullName,
      email: rawEmail,
      password,
      phoneNumber,
      street,
      city,
      state,
      zipCode,
      country,
    } = req.body ?? {};

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
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Build payload matching DB schema
    const insertPayload: NewCustomer = {
      customerID: email, // maps to varchar
      fullName, // text
      password: hashedPassword, // bcrypt hash
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
      .single<Customer>();

    if (insertError) {
      const msg = String(insertError.message || "");
      const code = String((insertError as any).code || "");
      if (
        code === "23505" ||
        msg.toLowerCase().includes("duplicate") ||
        msg.toLowerCase().includes("unique")
      ) {
        return res.status(409).json({ error: "User already exists" });
      }

      console.error("Signup insert error:", insertError);
      return res.status(500).json({ error: "Internal server error" });
    }

    return res.status(201).json({ message: "User created", user: inserted });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
