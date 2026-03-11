import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";

const sessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  session_date: z.string(),
  duration_minutes: z.number().int().positive().optional(),
  focus_rating: z.number().int().min(1).max(10).optional(),
  energy_rating: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
});

class SessionController extends BaseController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, []);
      return;
    }
    const sessions = db.query("SELECT * FROM sessions WHERE user_id = ? ORDER BY session_date DESC", userId);
    this.ok(res, sessions);
  });

  getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, []);
      return;
    }
    const date = req.params.date;
    const sessions = db.query("SELECT * FROM sessions WHERE user_id = ? AND session_date = ?", [userId, date]);
    this.ok(res, sessions);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Session not found");
      return;
    }
    const id = parseInt(req.params.id);
    const session = db.findOne("sessions", { id, user_id: userId });
    if (!session) {
      this.notFound(res, "Session not found");
      return;
    }
    this.ok(res, session);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res, "Authentication required");
      return;
    }
    const data = sessionSchema.parse(req.body);
    const session = db.create("sessions", {
      ...data,
      user_id: userId,
    });
    this.created(res, session);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Session not found");
      return;
    }
    const id = parseInt(req.params.id);
    const existing = db.findOne("sessions", { id, user_id: userId });
    if (!existing) {
      this.notFound(res, "Session not found");
      return;
    }
    const data = sessionSchema.partial().parse(req.body);
    const session = db.update("sessions", id, data);
    this.ok(res, session);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Session not found");
      return;
    }
    const id = parseInt(req.params.id);
    const existing = db.findOne("sessions", { id, user_id: userId });
    if (!existing) {
      this.notFound(res, "Session not found");
      return;
    }
    db.delete("sessions", id);
    this.noContent(res);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, { count: 0, minutes: 0 });
      return;
    }
    
    // Get sessions for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const sessions = db.query<{ duration_minutes: number | null }>(
      "SELECT * FROM sessions WHERE user_id = ? AND session_date >= ?",
      [userId, dateStr]
    );

    const count = sessions.length;
    const minutes = sessions.reduce((sum: number, s) => {
      return sum + (s.duration_minutes || 0);
    }, 0);

    this.ok(res, { count, minutes });
  });
}

export const sessionController = new SessionController();
