import "dotenv/config";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { logger, errorHandler, notFoundHandler } from "./middleware/index.js";
import routes from "./routes/index.js";
import { initDatabase, closeDatabase } from "./lib/database.js";
import { initGemini } from "./lib/gemini.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

initDatabase();
initGemini();

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
});

process.on("SIGINT", () => {
  console.log("\nShutting down...");
  closeDatabase();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
