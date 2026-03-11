import { Router } from "express";
import { aiConversationController } from "../controllers/Index.js";
import { validateParams } from "../middleware/index.js";
import { authMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const conversationSchema = z.object({
  title: z.string().optional(),
  model: z.string().optional(),
});

const messageSchema = z.object({
  role: z.enum(["user", "model"]),
  content: z.string().min(1),
  tokens_used: z.number().int().positive().optional(),
});

const conversationIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", authMiddleware, aiConversationController.getAll);
router.get("/:id", authMiddleware, validateParams(conversationIdSchema), aiConversationController.getById);
router.post("/", authMiddleware, aiConversationController.create);
router.post("/:id/messages", authMiddleware, validateParams(conversationIdSchema), aiConversationController.addMessage);
router.patch("/:id", authMiddleware, validateParams(conversationIdSchema), aiConversationController.updateTitle);
router.delete("/:id", authMiddleware, validateParams(conversationIdSchema), aiConversationController.delete);

export default router;
