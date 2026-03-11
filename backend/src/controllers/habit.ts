import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";

const habitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  target_count: z.number().int().positive().optional(),
});

const habitIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

class HabitController extends BaseController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, []);
      return;
    }
    const habits = db.query("SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC", userId);
    this.ok(res, habits);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Habit not found");
      return;
    }
    const { id } = habitIdSchema.parse(req.params);
    const habit = db.findOne("habits", { id, user_id: userId });
    
    if (!habit) {
      this.notFound(res, "Habit not found");
      return;
    }
    
    this.ok(res, habit);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res, "Authentication required");
      return;
    }
    const data = habitSchema.parse(req.body);
    const habit = db.create("habits", {
      ...data,
      user_id: userId,
    });
    this.created(res, habit);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Habit not found");
      return;
    }
    const { id } = habitIdSchema.parse(req.params);
    const data = habitSchema.partial().parse(req.body);
    
    const existing = db.findOne("habits", { id, user_id: userId });
      
    if (!existing) {
      this.notFound(res, "Habit not found");
      return;
    }
    
    const habit = db.update("habits", id, data);
    this.ok(res, habit);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Habit not found");
      return;
    }
    const { id } = habitIdSchema.parse(req.params);
    
    const existing = db.findOne("habits", { id, user_id: userId });
      
    if (!existing) {
      this.notFound(res, "Habit not found");
      return;
    }
    
    db.delete("habits", id);
    this.noContent(res);
  });

  logCompletion = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Habit not found");
      return;
    }
    const { id } = habitIdSchema.parse(req.params);
    const { notes } = req.body;
    
    const habit = db.findOne("habits", { id, user_id: userId });
      
    if (!habit) {
      this.notFound(res, "Habit not found");
      return;
    }
    
    const log = db.create("habit_logs", { 
      habit_id: id, 
      notes: notes || null,
      user_id: userId 
    });
    this.created(res, log);
  });

  getLogs = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Habit not found");
      return;
    }
    const { id } = habitIdSchema.parse(req.params);
    
    const habit = db.findOne("habits", { id, user_id: userId });
      
    if (!habit) {
      this.notFound(res, "Habit not found");
      return;
    }
    
    const logs = db.query("SELECT * FROM habit_logs WHERE habit_id = ? ORDER BY completed_at DESC", id);
    this.ok(res, logs);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return this.ok(res, { rate: 0 });
    }

    // Get total habits for user
    const habits = db.findMany<{ id: number; frequency: string }>("habits", { user_id: userId });
    if (habits.length === 0) {
      return this.ok(res, { rate: 0 });
    }

    // Calculate completion rate for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    let totalExpected = 0;
    let totalCompleted = 0;

    for (const habit of habits) {
      const frequency = habit.frequency || 'daily';
      if (frequency === 'daily') {
        totalExpected += 7;
      } else if (frequency === 'weekly') {
        totalExpected += 1;
      } else {
        totalExpected += 0.25;
      }

      const logs = db.query<{ count: number }>(
        "SELECT COUNT(*) as count FROM habit_logs WHERE habit_id = ? AND completed_at >= ?",
        [habit.id, dateStr]
      );
      totalCompleted += logs[0]?.count || 0;
    }

    const rate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
    this.ok(res, { rate: Math.min(100, rate) });
  });
}

export const habitController = new HabitController();
