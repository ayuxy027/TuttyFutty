import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";

const sessionIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

class UserSessionController extends BaseController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const sessions = db.query(
      "SELECT * FROM user_sessions WHERE user_id = ? ORDER BY started_at DESC",
      userId
    );
    this.ok(res, sessions);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = sessionIdSchema.parse(req.params);
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const session = db.findOne("user_sessions", { id, user_id: userId });
    if (!session) {
      this.notFound(res, "Session not found");
      return;
    }

    this.ok(res, session);
  });

  getCurrent = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const session = db.query(
      "SELECT * FROM user_sessions WHERE user_id = ? AND ended_at IS NULL ORDER BY started_at DESC LIMIT 1",
      userId
    )[0];

    if (!session) {
      this.notFound(res, "No active session");
      return;
    }

    this.ok(res, session);
  });

  startSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const { device_info, ip_address } = req.body;

    const session = db.create("user_sessions", {
      user_id: userId,
      device_info: device_info || null,
      ip_address: ip_address || null,
    });

    this.created(res, session);
  });

  updateActivity = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const { device_info, ip_address } = req.body;

    // Find active sessions for this user
    const sessions = db.findMany<{ id: number; user_id: number; ended_at: string | null; device_info: string | null; ip_address: string | null }>("user_sessions", { user_id: userId });
    const activeSession = sessions.find(s => !s.ended_at);

    if (activeSession) {
      db.update("user_sessions", activeSession.id, {
        last_active_at: new Date().toISOString(),
        device_info: device_info || activeSession.device_info,
        ip_address: ip_address || activeSession.ip_address,
      });
      this.ok(res, { message: "Session updated" });
    } else {
      const newSession = db.create("user_sessions", {
        user_id: userId,
        device_info: device_info || null,
        ip_address: ip_address || null,
      });
      this.created(res, newSession);
    }
  });

  updateActivityById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = sessionIdSchema.parse(req.params);
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const session = db.findOne("user_sessions", { id, user_id: userId });
    if (!session) {
      this.notFound(res, "Session not found");
      return;
    }

    // Use raw SQL to avoid issues
    db.run("UPDATE user_sessions SET last_active_at = ? WHERE id = ?", 
      new Date().toISOString(), 
      id
    );

    const updated = db.findOne("user_sessions", { id });
    this.ok(res, updated);
  });

  endSession = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    // Find active sessions for this user
    const sessions = db.findMany<{ id: number; user_id: number; ended_at: string | null }>("user_sessions", { user_id: userId });
    const activeSession = sessions.find(s => !s.ended_at);

    if (!activeSession) {
      this.notFound(res, "No active session");
      return;
    }

    // Use raw SQL
    db.run("UPDATE user_sessions SET ended_at = ? WHERE id = ?", 
      new Date().toISOString(), 
      activeSession.id
    );

    this.ok(res, { message: "Session ended" });
  });

  endSessionById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = sessionIdSchema.parse(req.params);
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const session = db.findOne("user_sessions", { id, user_id: userId });
    if (!session) {
      this.notFound(res, "Session not found");
      return;
    }

    // Use raw SQL
    db.run("UPDATE user_sessions SET ended_at = ? WHERE id = ?", 
      new Date().toISOString(), 
      id
    );

    const updated = db.findOne("user_sessions", { id });
    this.ok(res, updated);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const totalSessions = db.query(
      "SELECT COUNT(*) as count FROM user_sessions WHERE user_id = ?",
      userId
    )[0] as { count: number };

    const activeSessions = db.query(
      "SELECT COUNT(*) as count FROM user_sessions WHERE user_id = ? AND ended_at IS NULL",
      userId
    )[0] as { count: number };

    const recentActivity = db.query(
      "SELECT COUNT(*) as count FROM user_activities WHERE user_id = ? AND created_at > datetime('now', '-24 hours')",
      userId
    )[0] as { count: number };

    this.ok(res, {
      total_sessions: totalSessions?.count || 0,
      active_sessions: activeSessions?.count || 0,
      activities_last_24h: recentActivity?.count || 0,
    });
  });
}

export const userSessionController = new UserSessionController();
