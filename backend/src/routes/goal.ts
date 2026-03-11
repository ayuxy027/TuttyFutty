import { Router } from "express";
import { goalController } from "../controllers/Index.js";
import { validateBody, validateParams } from "../middleware/index.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

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

router.get("/", optionalAuthMiddleware, goalController.getAll);
router.get("/:id", optionalAuthMiddleware, validateParams(goalIdSchema), goalController.getById);
router.post("/", optionalAuthMiddleware, validateBody(goalSchema), goalController.create);
router.patch("/:id", optionalAuthMiddleware, validateParams(goalIdSchema), validateBody(goalSchema.partial()), goalController.update);
router.delete("/:id", optionalAuthMiddleware, validateParams(goalIdSchema), goalController.delete);

export default router;
