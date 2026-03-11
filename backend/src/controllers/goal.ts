import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";

const goalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  target_date: z.string().optional(),
  status: z.enum(["active", "completed", "archived"]).optional(),
  priority: z.number().int().optional(),
});

const goalIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

class GoalController extends BaseController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, []);
      return;
    }
    const goals = db.query("SELECT * FROM goals WHERE user_id = ? ORDER BY priority DESC, created_at DESC", userId);
    this.ok(res, goals);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Goal not found");
      return;
    }
    const { id } = goalIdSchema.parse(req.params);
    const goal = db.findOne("goals", { id, user_id: userId });
    
    if (!goal) {
      this.notFound(res, "Goal not found");
      return;
    }
    
    this.ok(res, goal);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res, "Authentication required");
      return;
    }
    const data = goalSchema.parse(req.body);
    const goal = db.create("goals", {
      ...data,
      user_id: userId,
    });
    this.created(res, goal);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Goal not found");
      return;
    }
    const { id } = goalIdSchema.parse(req.params);
    const data = goalSchema.partial().parse(req.body);
    
    const existing = db.findOne("goals", { id, user_id: userId });
      
    if (!existing) {
      this.notFound(res, "Goal not found");
      return;
    }
    
    const goal = db.update("goals", id, data);
    this.ok(res, goal);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Goal not found");
      return;
    }
    const { id } = goalIdSchema.parse(req.params);
    
    const existing = db.findOne("goals", { id, user_id: userId });
      
    if (!existing) {
      this.notFound(res, "Goal not found");
      return;
    }
    
    db.delete("goals", id);
    this.noContent(res);
  });
}

export const goalController = new GoalController();
