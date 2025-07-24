
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
    console.log("Received POST /orders request");

    await connectToMongo();
    console.log("Mongo connected in POST /orders");

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
      senderWallet,
      status,
    } = req.body;

    console.log("Request body:", req.body);

    const db = client.db("Itiza_Delivery");
    const orders = db.collection("web3orders");
    const users = db.collection("web3users");

    console.log("Inserting order...");

    const result = await orders.insertOne({
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
      senderWallet,
      status,
      createdAt: new Date(),
    });

    console.log("Inserted order:", result.insertedId);

    // Check if senderWallet exists in web3users
    const existingUser = await users.findOne({ senderWallet });

    if (!existingUser) {
      console.log("No existing user. Creating new web3 user record...");

      await users.insertOne({
        senderWallet,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date(),
      });

      console.log("New web3 user created.");
    } else {
      console.log("Existing user found. Updating stats...");

      await users.updateOne(
        { senderWallet },
        {
          $inc: {
            totalOrders: 1,
            totalSpent: price,
          },
        }
      );

      console.log("User stats updated.");
    }

    res.status(201).json({ message: "Order and user stats updated successfully" });
  } catch (err) {
    console.error("Error saving order:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;






















