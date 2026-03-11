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
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const tasks = db.findMany("tasks", {});
    this.ok(res, tasks);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const task = db.findOne("tasks", { id });
    if (!task) {
      this.notFound(res, "Task not found");
      return;
    }
    this.ok(res, task);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
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
      user_id: req.user?.id || null,
    });
    this.created(res, task);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const data = taskSchema.partial().parse(req.body);
    // Filter out undefined values
    const filteredData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        filteredData[key] = value;
      }
    }
    const task = db.update("tasks", id, filteredData);
    if (!task) {
      this.notFound(res, "Task not found");
      return;
    }
    this.ok(res, task);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    db.delete("tasks", id);
    this.noContent(res);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    // Get tasks for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    let tasks;
    if (userId) {
      tasks = db.query(
        "SELECT * FROM tasks WHERE user_id = ? AND created_at >= ?",
        [userId, dateStr]
      );
    } else {
      tasks = db.query(
        "SELECT * FROM tasks WHERE created_at >= ?",
        [dateStr]
      );
    }

    const completed = tasks.filter((t: { status: string }) => t.status === 'completed').length;
    const total = tasks.length;

    this.ok(res, { completed, total });
  });
}

export const taskController = new TaskController();
