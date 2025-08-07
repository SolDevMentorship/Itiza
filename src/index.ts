
// src/index.ts

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ordersRouter from "./order";
import { connectToMongo } from "./mongoClient";
import authRouter from "./auth"; 
import sendOtpRouter from "./sendOTP";
import loginUser from "./loginUser";
import itemsRouter from "./items";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Middleware
app.use(cors({
  origin: ["http://localhost:4000", "http://localhost:5173"], // Add your frontend ports
  credentials: true
}));
app.use(express.json());

// Add request logging middleware
app.use((req, _res, next) => {
  console.log(`📥 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Test root route
app.get("/", (_req, res) => {
  res.json({ message: "Itiza Delivery API is running!" });
});

// Routes
app.use("/Itiza_Delivery/orders", ordersRouter);
app.use("/Itiza_Delivery/items", itemsRouter);
app.use("/Itiza_Delivery/auth", authRouter);
app.use("/Itiza_Delivery", sendOtpRouter);
app.use("/Itiza_Delivery/users/login", loginUser); 

// ...existing code...

// Route debugging - List all registered routes
app.get("/debug/routes", (_req, res) => {
  const routes: any[] = [];

  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      // Direct routes
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router' && middleware.handle.stack) {
      // Router middleware
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });

  res.json({ registeredRoutes: routes });
});


// Start server
app.listen(PORT, async () => {
  try {
    // Optional: connect once at startup if you want to "warm up" the DB connection.
    await connectToMongo();
    console.log(`🌟 Server running on port ${PORT}`);
    console.log(`🔗 Test your routes at:`);
    console.log(`   - http://localhost:${PORT}/`);
    console.log(`   - http://localhost:${PORT}/debug/routes`);
    console.log(`   - http://localhost:${PORT}/Itiza_Delivery/sendOTP/test`);
    console.log(`   - http://localhost:${PORT}/Itiza_Delivery/items`);
  } catch (err) {
    console.error("Failed to connect to MongoDB at startup:", err);
    process.exit(1); // Exit process if Mongo connection failed
  }
});








