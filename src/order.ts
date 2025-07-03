
import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();
console.log("MONGODB_URI:", process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

// Create MongoClient once, globally
const client = new MongoClient(MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
});

let isConnected = false;

// Helper to connect (safe to call multiple times)
async function connectToMongo() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
      console.log("MongoDB connected");
    } catch (err) {
      console.error("MongoDB connection error:", err);
      throw err;
    }
  }
}

export async function closeMongoConnection() {
  if (isConnected) {
    try {
      await client.close();
      isConnected = false;
      console.log("MongoDB connection closed");
    } catch (err) {
      console.error("Error closing MongoDB connection:", err);
    }
  }
}

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    await connectToMongo();
    const {
      id,
      item,
      recipientName,
      phone,
      address,
      note,
      relation,
      txSignature,
      price,
      amountInSol,
      networkFee,
      userEmail,
    } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: "User email is required" });
    }

    const db = client.db("Itiza_Delivery");
    const orders = db.collection("orders");
    const users = db.collection("users");
    const items = db.collection("items");

    // Save the order
    await orders.insertOne({
      id,
      item,
      recipientName,
      phone,
      address,
      note,
      relation,
      txSignature,
      price,
      amountInSol,
      networkFee,
      userEmail,
      createdAt: new Date(),
    });

    // Update user stats
    await users.updateOne(
      { UserID: userEmail },
      {
        $inc: {
          totalOrders: 1,
          totalSpent: price,
        },
      }
    );

    // Update stock quantity
    await items.updateOne(
      { name: item },
      {
        $inc: { stockQuantity: -1 },
      }
    );

    res.status(201).json({ message: "Order saved and user/item updated successfully" });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
 

export default router;












