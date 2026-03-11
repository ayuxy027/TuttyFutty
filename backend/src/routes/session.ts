import { Router } from "express";
import { sessionController } from "../controllers/Index.js";
import { validateBody, validateParams } from "../middleware/index.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const sessionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  session_date: z.string(),
  duration_minutes: z.number().int().positive().optional(),
  focus_rating: z.number().int().min(1).max(10).optional(),
  energy_rating: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
});

const sessionIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", optionalAuthMiddleware, sessionController.getAll);
router.get("/stats", optionalAuthMiddleware, sessionController.getStats);
router.get("/date/:date", optionalAuthMiddleware, validateParams(z.object({ date: z.string() })), sessionController.getByDate);
router.get("/:id", optionalAuthMiddleware, validateParams(sessionIdSchema), sessionController.getById);
router.post("/", optionalAuthMiddleware, validateBody(sessionSchema), sessionController.create);
router.patch("/:id", optionalAuthMiddleware, validateParams(sessionIdSchema), validateBody(sessionSchema.partial()), sessionController.update);
router.delete("/:id", optionalAuthMiddleware, validateParams(sessionIdSchema), sessionController.delete);

export default router;
