import { Router } from "express";
import { dailyPlanController } from "../controllers/index.js";
import { validateBody, validateParams } from "../middleware/index.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const dailyPlanSchema = z.object({
  plan_date: z.string(),
  tasks: z.string().optional(),
  notes: z.string().optional(),
  focus_areas: z.string().optional(),
});

const dailyPlanIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", optionalAuthMiddleware, dailyPlanController.getAll);
router.get("/date/:date", optionalAuthMiddleware, validateParams(z.object({ date: z.string() })), dailyPlanController.getByDate);
router.get("/:id", optionalAuthMiddleware, validateParams(dailyPlanIdSchema), dailyPlanController.getById);
router.post("/", optionalAuthMiddleware, validateBody(dailyPlanSchema), dailyPlanController.create);
router.put("/date/:date", optionalAuthMiddleware, validateParams(z.object({ date: z.string() })), validateBody(dailyPlanSchema.partial()), dailyPlanController.upsert);
router.patch("/:id", optionalAuthMiddleware, validateParams(dailyPlanIdSchema), validateBody(dailyPlanSchema.partial()), dailyPlanController.update);
router.delete("/:id", optionalAuthMiddleware, validateParams(dailyPlanIdSchema), dailyPlanController.delete);

export default router;
