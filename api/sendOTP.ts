

// src/api/sendOTP.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter once at module load so we don't re-create it per request
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Verify transporter (debug-friendly)
transporter
  .verify()
  .then(() => console.log("[sendOTP] Nodemailer transporter ready"))
  .catch((err: any) => console.warn("[sendOTP] Nodemailer transporter verification failed:", err?.message ?? err));

/**
 * Set CORS headers - MUST be called before any response
 */
function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  try {
    const allowedOriginsEnv = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const origin = String(req.headers.origin || "");
    let allowOriginHeader = "";

    // Check for wildcard OR specific origin
    if (allowedOriginsEnv.includes("*") || allowedOriginsEnv.includes(origin)) {
      allowOriginHeader = origin;
    }

    // Debug logging
    console.log("[sendOTP] CORS Debug:", {
      origin,
      allowedOriginsEnv,
      allowOriginHeader,
      envRaw: process.env.ALLOWED_ORIGINS,
    });

    if (allowOriginHeader) {
      res.setHeader("Access-Control-Allow-Origin", allowOriginHeader);
      res.setHeader("Access-Control-Allow-Credentials", "true");
    }

    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  } catch (err) {
    console.error("[sendOTP] CORS setup error:", err);
    // Fallback: set permissive CORS on error
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
}

/**
 * Vercel Node handler for POST /sendOTP
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CRITICAL: Set CORS headers FIRST
  setCorsHeaders(req, res);

  // Handle preflight immediately
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Main handler
  try {
    const { email, otp } = req.body ?? {};

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || `"Itiza" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Itiza Verification Code",
      html: `<h2>Your OTP:</h2><h1>${String(otp)}</h1>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("[sendOTP] OTP sent to:", email, { messageId: info?.messageId });
    return res.status(200).json({ message: "OTP sent successfully", info: { messageId: info?.messageId } });
  } catch (error: any) {
    console.error("[sendOTP] OTP send failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: "Failed to send OTP", details: errorMessage });
  }
}