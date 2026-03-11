import { Router } from "express";
import { journalController } from "../controllers/Index.js";
import { validateBody, validateParams } from "../middleware/index.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const journalSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
  mood: z.string().optional(),
  tags: z.string().optional(),
  entry_date: z.string(),
});

const journalIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", optionalAuthMiddleware, journalController.getAll);
router.get("/stats", optionalAuthMiddleware, journalController.getStats);
router.get("/date/:date", optionalAuthMiddleware, validateParams(z.object({ date: z.string() })), journalController.getByDate);
router.get("/:id", optionalAuthMiddleware, validateParams(journalIdSchema), journalController.getById);
router.post("/", optionalAuthMiddleware, validateBody(journalSchema), journalController.create);
router.patch("/:id", optionalAuthMiddleware, validateParams(journalIdSchema), validateBody(journalSchema.partial()), journalController.update);
router.delete("/:id", optionalAuthMiddleware, validateParams(journalIdSchema), journalController.delete);

export default router;
