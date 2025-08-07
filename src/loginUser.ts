

// src/loginUser.ts
import express from "express";
import { connectToMongo, getMongoClient } from "./mongoClient";

const router = express.Router();

router.post("/", async (req, res) => {
  console.log("👀 Hit /login with body:", req.body);
  
  try {
    await connectToMongo();
    const client = getMongoClient();
    const db = client.db("Itiza_Delivery");
    const users = db.collection("users");

    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email (using UserID field as per your signup logic)
    const user = await users.findOne({ UserID: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare passwords (plain text comparison for now)
    // Note: You should implement password hashing for security
    if (user.Password !== password) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Login successful - prepare user data (exclude password)
    const userData = {
      id: user._id,
      email: user.UserID,
      fullName: user.FullName,
      createdAt: user.createdAt
    };

    return res.status(200).json({ 
      message: "Login successful",
      user: userData,
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

