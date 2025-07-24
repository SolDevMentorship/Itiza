import express from "express";
import { connectToMongo, getMongoClient } from "./mongoClient";

const router = express.Router();

router.post("/signup", async (req, res) => {
    console.log("👀 Hit /signup with body:", req.body);
  try {
    await connectToMongo();
    const client = getMongoClient();
    const db = client.db("Itiza_Delivery");
    const users = db.collection("users");

    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existingUser = await users.findOne({ UserID: email });
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const result = await users.insertOne({
      UserID: email,
      FullName: fullName,
      Password: password, // ✅ You can hash this later with bcrypt
      totalOrders: 0,
      totalSpent: 0,
      createdAt: new Date(),
    });

    return res.status(201).json({ message: "User created", userId: result.insertedId });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
