import { Request, Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { 
  generateContent, 
  chatGenerateContent,
  getModel
} from "../lib/gemini.js";
import { createError } from "../middleware/error.js";
import { AuthRequest } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { logActivity } from "../lib/activity.js";
import { aiService } from "../lib/aiService.js";

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

class AiController extends BaseController {
  generateQuiz = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { topic, count } = quizGenerateSchema.parse(req.body);
    const userId = req.user?.id;
    
    // Use a default topic if not provided
    const quizTopic = topic || "general knowledge";
    const result = await aiService.generateQuiz(quizTopic, count);
    
    if (!result.success || !result.quiz) {
      throw createError(result.error || "Failed to generate quiz", 500, "GENERATION_ERROR");
    }

    // Transform the quiz to the format expected by the frontend
    const quizData = result.quiz.map((q, index) => ({
      question: q.question,
      options: q.options,
      correct: q.correctIndex,
      explanation: `The correct answer is: ${q.options[q.correctIndex]}`,
    }));

    // Store quiz attempt if user is authenticated
    if (userId) {
      db.create("quiz_attempts", {
        user_id: userId,
        question: quizData[0]?.question || "",
        is_correct: false,
        goal_title: quizTopic,
        step_number: 1,
        attempted_at: new Date().toISOString(),
      });
    }

    this.ok(res, quizData[0] || { question: "", options: [], correct: 0 });
  });

  getQuizAttempts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      // Return empty array for unauthenticated users
      return this.ok(res, []);
    }

    const attempts = db.findMany("quiz_attempts", { user_id: userId });
    this.ok(res, attempts);
  });
  generate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { prompt, conversation_id } = generateSchema.parse(req.body);
    const userId = req.user?.id;
    
    const result = await generateContent(prompt);
    
    if (!result) {
      throw createError("Gemini API not configured", 503, "SERVICE_UNAVAILABLE");
    }

    if (userId && conversation_id) {
      db.create("ai_messages", {
        conversation_id,
        role: "user",
        content: prompt,
        tokens_used: null,
      });
      
      db.create("ai_messages", {
        conversation_id,
        role: "model",
        content: result,
        tokens_used: null,
      });

      db.update("ai_conversations", conversation_id, {
        updated_at: new Date().toISOString(),
      });

      logActivity(userId, "ai_generate", "ai_message", conversation_id, { prompt_length: prompt.length });
    }

    this.ok(res, { result });
  });

  generateStream = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { prompt, conversation_id } = generateSchema.parse(req.body);
    const userId = req.user?.id;
    
    const model = getModel();
    if (!model) {
      throw createError("Gemini API not configured", 503, "SERVICE_UNAVAILABLE");
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let fullResponse = "";
    const result = await model.generateContentStream(prompt);
    
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    if (userId && conversation_id) {
      db.create("ai_messages", {
        conversation_id,
        role: "user",
        content: prompt,
        tokens_used: null,
      });
      
      db.create("ai_messages", {
        conversation_id,
        role: "model",
        content: fullResponse,
        tokens_used: null,
      });

      db.update("ai_conversations", conversation_id, {
        updated_at: new Date().toISOString(),
      });

      logActivity(userId, "ai_generate_stream", "ai_message", conversation_id);
    }
  });

  chat = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { messages, conversation_id } = chatSchema.parse(req.body);
    const userId = req.user?.id;
    
    const result = await chatGenerateContent(messages);
    
    if (!result) {
      throw createError("Gemini API not configured", 503, "SERVICE_UNAVAILABLE");
    }

    if (userId && conversation_id) {
      const lastUserMessage = messages.filter(m => m.role === "user").pop();
      if (lastUserMessage) {
        db.create("ai_messages", {
          conversation_id,
          role: "user",
          content: lastUserMessage.parts,
          tokens_used: null,
        });
      }
      
      db.create("ai_messages", {
        conversation_id,
        role: "model",
        content: result,
        tokens_used: null,
      });

      db.update("ai_conversations", conversation_id, {
        updated_at: new Date().toISOString(),
      });

      logActivity(userId, "ai_chat", "ai_message", conversation_id);
    }

    this.ok(res, { result });
  });

  chatStream = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { messages, conversation_id } = chatSchema.parse(req.body);
    const userId = req.user?.id;
    
    const model = getModel();
    if (!model) {
      throw createError("Gemini API not configured", 503, "SERVICE_UNAVAILABLE");
    }

    const chat = model.startChat({
      history: messages.slice(0, -1).map((m: { role: string; parts: string }) => ({
        role: m.role,
        parts: [{ text: m.parts }],
      })),
    });

    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessageStream(lastMessage.parts);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    let fullResponse = "";
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }
    
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    if (userId && conversation_id) {
      db.create("ai_messages", {
        conversation_id,
        role: "user",
        content: lastMessage.parts,
        tokens_used: null,
      });
      
      db.create("ai_messages", {
        conversation_id,
        role: "model",
        content: fullResponse,
        tokens_used: null,
      });

      db.update("ai_conversations", conversation_id, {
        updated_at: new Date().toISOString(),
      });

      logActivity(userId, "ai_chat_stream", "ai_message", conversation_id);
    }
  });
}

export const aiController = new AiController();
