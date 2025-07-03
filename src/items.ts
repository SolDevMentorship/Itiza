


// src/items.ts
import express from "express";
import { connectToMongo, getMongoClient } from "./mongoClient";
import { Buffer } from "buffer";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await connectToMongo();
    const client = getMongoClient();
    const collection = client.db("Itiza_Delivery").collection("items");

    const items = await collection.find().toArray();

    const response = items.map(item => {
      // handle either Binary or Buffer
      const buffer = item.img?.buffer || item.img;
      const base64 = Buffer.from(buffer).toString("base64");
      const mimeType = item.contentType || "image/png";

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        img: `data:${mimeType};base64,${base64}`,
        description: item.description,        // ← new
        stockQuantity: item.stockQuantity     // ← new
      };
    });

    res.status(200).json(response);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to fetch items." });
  }
});

export default router;
