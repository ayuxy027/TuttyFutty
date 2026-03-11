import { Router } from "express";
import { taskController } from "../controllers/Index.js";
import { validateBody } from "../middleware/index.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const taskSchema = z.object({
  sprint_id: z.number().int().positive().optional(),
  goal_id: z.number().int().positive().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
  priority: z.number().int().optional(),
  due_date: z.string().optional(),
});

const taskIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", optionalAuthMiddleware, taskController.getAll);
router.get("/stats", optionalAuthMiddleware, taskController.getStats);
router.get("/:id", optionalAuthMiddleware, taskController.getById);
router.post("/", optionalAuthMiddleware, validateBody(taskSchema), taskController.create);
router.patch("/:id", optionalAuthMiddleware, validateBody(taskSchema.partial()), taskController.update);
router.delete("/:id", optionalAuthMiddleware, taskController.delete);

export default router;
