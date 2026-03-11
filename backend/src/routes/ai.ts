import { Router } from "express";
import { aiController } from "../controllers/index.js";
import { validateBody } from "../middleware/index.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const generateSchema = z.object({
  prompt: z.string().min(1),
  conversation_id: z.number().int().positive().optional(),
});

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      parts: z.string(),
    })
  ),
  conversation_id: z.number().int().positive().optional(),
});

const quizGenerateSchema = z.object({
  topic: z.string().min(1).optional(),
  count: z.number().int().positive().max(10).default(5),
});

router.post("/generate", optionalAuthMiddleware, validateBody(generateSchema), aiController.generate);
router.post("/generate/stream", optionalAuthMiddleware, validateBody(generateSchema), aiController.generateStream);
router.post("/chat", optionalAuthMiddleware, validateBody(chatSchema), aiController.chat);
router.post("/chat/stream", optionalAuthMiddleware, validateBody(chatSchema), aiController.chatStream);

// Quiz endpoints
router.post("/quiz/generate", optionalAuthMiddleware, validateBody(quizGenerateSchema), aiController.generateQuiz);
router.get("/quiz/attempts", optionalAuthMiddleware, aiController.getQuizAttempts);

export default router;
