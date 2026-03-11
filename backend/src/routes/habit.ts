import { Router } from "express";
import { habitController } from "../controllers/index.js";
import { validateBody, validateParams } from "../middleware/index.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const habitSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  target_count: z.number().int().positive().optional(),
});

const habitIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const logSchema = z.object({
  notes: z.string().optional(),
});

router.get("/", optionalAuthMiddleware, habitController.getAll);
router.get("/stats", optionalAuthMiddleware, habitController.getStats);
router.get("/:id", optionalAuthMiddleware, validateParams(habitIdSchema), habitController.getById);
router.post("/", optionalAuthMiddleware, validateBody(habitSchema), habitController.create);
router.patch("/:id", optionalAuthMiddleware, validateParams(habitIdSchema), validateBody(habitSchema.partial()), habitController.update);
router.delete("/:id", optionalAuthMiddleware, validateParams(habitIdSchema), habitController.delete);
router.post("/:id/log", optionalAuthMiddleware, validateParams(habitIdSchema), validateBody(logSchema), habitController.logCompletion);
router.get("/:id/logs", optionalAuthMiddleware, validateParams(habitIdSchema), habitController.getLogs);

export default router;
