
// src/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ordersRouter from "./order";
import itemsRouter from "./items";
import { connectToMongo } from "./mongoClient";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/Itiza_Delivery/orders", ordersRouter);
app.use("/Itiza_Delivery/items", itemsRouter);

// Start server
app.listen(PORT, async () => {
  try {
    // Optional: connect once at startup if you want to "warm up" the DB connection.
    await connectToMongo();
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    console.error("Failed to connect to MongoDB at startup:", err);
    process.exit(1); // Exit process if Mongo connection failed
  }
});












