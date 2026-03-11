import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { logger, errorHandler, notFoundHandler, securityHeaders, sanitizeInput } from "./middleware/index.js";
import routes from "./routes/index.js";
import { initDatabase, closeDatabase } from "./lib/database.js";
import { initGemini } from "./lib/gemini.js";

const app = express();

// Security middleware - must come before other middleware
app.use(securityHeaders);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.ALLOWED_ORIGINS?.split(",") || ["https://tuttyfutty.com"]
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400, // 24 hours
}));

// Body parser with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Input sanitization
app.use(sanitizeInput);

// Request logging
app.use(logger);

// Initialize services
initDatabase();
initGemini();

// API routes
app.use("/api", routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`Security: Enhanced with rate limiting, input sanitization, and secure headers`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down...");
  closeDatabase();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\nSIGTERM received, shutting down...");
  closeDatabase();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
