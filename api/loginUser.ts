// src/api/login.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getSupabase } from "./supabaseClient";

/** Customer interface */
export interface Customer {
  id: number;
  customerID: string;
  fullName: string;
  password: string | Buffer; // bcrypt hash string or bytea
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

// ✅ Helper to decode Postgres bytea (hex or Buffer) into UTF8 string
function decodeBytea(bytea: string | Buffer): string {
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
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from("customers")
      .select("*")
      .eq("customerID", String(customerID).toLowerCase().trim())
      .maybeSingle<Customer>();

    if (error) {
      console.error("❌ Supabase query error:", error);
      return res.status(500).json({ error: "Database error" });
    }

    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // ✅ Decode stored hash
    const storedHash = decodeBytea(user.password);

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not set");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const token = jwt.sign({ id: user.id, email: user.customerID }, secret, { expiresIn: "1h" });

    // Build Set-Cookie header similar to express' res.cookie
    const cookieParts = [
      `token=${token}`,
      `HttpOnly`,
      `Path=/`,
      `Max-Age=${60 * 60}`, // 1 hour in seconds
      `SameSite=Strict`,
    ];
    if (process.env.NODE_ENV === "production") {
      cookieParts.push("Secure");
    }
    const cookieHeader = cookieParts.join("; ");

    // Set the cookie header (Vercel functions don't have res.cookie)
    res.setHeader("Set-Cookie", cookieHeader);

    const { password: _pw, ...safeUser } = user as any;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
