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
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const sessions = db.findMany("sessions", {});
    this.ok(res, sessions);
  });

  getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.params.date;
    const sessions = db.findMany("sessions", { session_date: date });
    this.ok(res, sessions);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const session = db.findOne("sessions", { id });
    if (!session) {
      this.notFound(res, "Session not found");
      return;
    }
    this.ok(res, session);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = sessionSchema.parse(req.body);
    const session = db.create("sessions", {
      ...data,
      user_id: req.user?.id || null,
    });
    this.created(res, session);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const data = sessionSchema.partial().parse(req.body);
    const session = db.update("sessions", id, data);
    if (!session) {
      this.notFound(res, "Session not found");
      return;
    }
    this.ok(res, session);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    db.delete("sessions", id);
    this.noContent(res);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    // Get sessions for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    let sessions;
    if (userId) {
      sessions = db.query(
        "SELECT * FROM sessions WHERE user_id = ? AND session_date >= ?",
        [userId, dateStr]
      );
    } else {
      sessions = db.query(
        "SELECT * FROM sessions WHERE session_date >= ?",
        [dateStr]
      );
    }

    const count = sessions.length;
    const minutes = sessions.reduce((sum: number, s: { duration_minutes: number | null }) => {
      return sum + (s.duration_minutes || 0);
    }, 0);

    this.ok(res, { count, minutes });
  });
}

export const sessionController = new SessionController();
