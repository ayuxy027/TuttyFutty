import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";

const taskSchema = z.object({
  sprint_id: z.number().int().positive().optional(),
  goal_id: z.number().int().positive().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  priority: z.number().int().optional(),
  due_date: z.string().optional(),
});

class TaskController extends BaseController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, []);
      return;
    }
    const tasks = db.query("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC", userId);
    this.ok(res, tasks);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Task not found");
      return;
    }
    const id = parseInt(req.params.id);
    const task = db.findOne("tasks", { id, user_id: userId });
    if (!task) {
      this.notFound(res, "Task not found");
      return;
    }
    this.ok(res, task);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res, "Authentication required");
      return;
    }
    const data = taskSchema.parse(req.body);
    // Filter out undefined values
    const filteredData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    }
    const task = db.create("tasks", {
      ...filteredData,
      user_id: userId,
    });
    this.created(res, task);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Task not found");
      return;
    }
    const id = parseInt(req.params.id);
    const existing = db.findOne("tasks", { id, user_id: userId });
    if (!existing) {
      this.notFound(res, "Task not found");
      return;
    }
    const data = taskSchema.partial().parse(req.body);
    // Filter out undefined values
    const filteredData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    }
    const task = db.update("tasks", id, filteredData);
    this.ok(res, task);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Task not found");
      return;
    }
    const id = parseInt(req.params.id);
    const existing = db.findOne("tasks", { id, user_id: userId });
    if (!existing) {
      this.notFound(res, "Task not found");
      return;
    }
    db.delete("tasks", id);
    this.noContent(res);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, { completed: 0, total: 0 });
      return;
    }
    
    // Get tasks for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const tasks = db.query<{ status: string }>(
      "SELECT * FROM tasks WHERE user_id = ? AND created_at >= ?",
      [userId, dateStr]
    );

    const completed = tasks.filter((t) => t.status === 'completed').length;
    const total = tasks.length;

    this.ok(res, { completed, total });
  });
}

export const taskController = new TaskController();
