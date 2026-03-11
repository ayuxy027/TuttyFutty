import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";

const dailyPlanSchema = z.object({
  plan_date: z.string(),
  tasks: z.string().optional(),
  notes: z.string().optional(),
  focus_areas: z.string().optional(),
});

class DailyPlanController extends BaseController {
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const plans = db.findMany("daily_plans", {});
    this.ok(res, plans);
  });

  getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.params.date;
    const plans = db.findMany("daily_plans", { plan_date: date });
    this.ok(res, plans);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const plan = db.findOne("daily_plans", { id });
    if (!plan) {
      this.notFound(res, "Daily plan not found");
      return;
    }
    this.ok(res, plan);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = dailyPlanSchema.parse(req.body);
    const plan = db.create("daily_plans", {
      ...data,
      user_id: req.user?.id || null,
    });
    this.created(res, plan);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const data = dailyPlanSchema.partial().parse(req.body);
    const plan = db.update("daily_plans", id, data);
    if (!plan) {
      this.notFound(res, "Daily plan not found");
      return;
    }
    this.ok(res, plan);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    db.delete("daily_plans", id);
    this.noContent(res);
  });

  upsert = asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.params.date;
    const data = dailyPlanSchema.partial().parse(req.body);
    
    const existing = db.findOne("daily_plans", { plan_date: date });
    if (existing) {
      const plan = db.update("daily_plans", existing.id, data);
      this.ok(res, plan);
    } else {
      const plan = db.create("daily_plans", {
        ...data,
        plan_date: date,
        user_id: req.user?.id || null,
      });
      this.created(res, plan);
    }
  });
}

export const dailyPlanController = new DailyPlanController();
