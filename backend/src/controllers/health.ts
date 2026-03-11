import { Request, Response } from "express";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { HealthCheck } from "../types/index.js";
import { getDatabase } from "../lib/database.js";
import { isGeminiConnected } from "../lib/gemini.js";

class HealthController extends BaseController {
  check = asyncHandler(async (_req: Request, res: Response) => {
    let sqliteStatus: "connected" | "disconnected" = "disconnected";
    
    try {
      const db = getDatabase();
      db.prepare("SELECT 1").get();
      sqliteStatus = "connected";
    } catch {
      sqliteStatus = "disconnected";
    }

    const health: HealthCheck = {
      status: sqliteStatus === "connected" ? "ok" : "error",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        sqlite: sqliteStatus,
        gemini: isGeminiConnected() ? "connected" : "not_configured",
      },
    };

    this.ok(res, health);
  });
}

export const healthController = new HealthController();
