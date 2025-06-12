// src/mongoClient.ts

import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

const client = new MongoClient(MONGODB_URI, {
  tls: true,
  tlsAllowInvalidCertificates: false,
});

let isConnected = false;

export async function connectToMongo() {
  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log("MongoDB connected");
  }
}

export async function closeMongoConnection() {
  if (isConnected) {
    await client.close();
    isConnected = false;
    console.log("MongoDB connection closed");
  }
}

export function getMongoClient() {
  return client;
}
