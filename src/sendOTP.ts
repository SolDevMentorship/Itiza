// src/sendOTP.ts

import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// POST /Itiza_Delivery/sendOTP
router.post("/sendOTP", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Itiza" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your Itiza Verification Code",
      html: `<h2>Your OTP:</h2><h1>${otp}</h1>`,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ OTP sent to:", email);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ OTP send failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ error: "Failed to send OTP", details: errorMessage });
  }
});

export default router;







