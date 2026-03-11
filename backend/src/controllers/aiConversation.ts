import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";
import { logActivity } from "../lib/activity.js";

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

interface Conversation {
  id: number;
  user_id: number;
  title: string;
  model: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: number;
  conversation_id: number;
  role: string;
  content: string;
  tokens_used: number | null;
  created_at: string;
}

class AiConversationController extends BaseController {
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    const conversations = userId
      ? db.query<Conversation>(
          "SELECT * FROM ai_conversations WHERE user_id = ? ORDER BY updated_at DESC",
          userId
        )
      : [];
    this.ok(res, conversations);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = conversationIdSchema.parse(req.params);
    const userId = req.user?.id;

    const conversation = userId
      ? db.findOne<Conversation>("ai_conversations", { id, user_id: userId })
      : null;

    if (!conversation) {
      this.notFound(res, "Conversation not found");
      return;
    }

    const messages = db.query<Message>(
      "SELECT * FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC",
      id
    );

    this.ok(res, { ...conversation, messages });
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = conversationSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      this.unauthorized(res);
      return;
    }

    const conversation = db.create<Conversation>("ai_conversations", {
      title: data.title || "New Conversation",
      model: data.model || "gemini-2.0-flash",
      user_id: userId,
    });

    logActivity(userId, "ai_conversation_created", "ai_conversation", conversation.id);

    this.created(res, conversation);
  });

  addMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = conversationIdSchema.parse(req.params);
    const data = messageSchema.parse(req.body);
    const userId = req.user?.id;

    const conversation = userId
      ? db.findOne<Conversation>("ai_conversations", { id, user_id: userId })
      : null;

    if (!conversation) {
      this.notFound(res, "Conversation not found");
      return;
    }

    const message = db.create<Message>("ai_messages", {
      conversation_id: id,
      role: data.role,
      content: data.content,
      tokens_used: data.tokens_used || null,
    });

    db.update("ai_conversations", id, {
      updated_at: new Date().toISOString(),
    });

    if (userId) {
      logActivity(userId, "ai_message_sent", "ai_message", message.id, {
        conversation_id: id,
        role: data.role,
      });
    }

    this.created(res, message);
  });

  updateTitle = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = conversationIdSchema.parse(req.params);
    const { title } = req.body;
    const userId = req.user?.id;

    const conversation = userId
      ? db.findOne<Conversation>("ai_conversations", { id, user_id: userId })
      : null;

    if (!conversation) {
      this.notFound(res, "Conversation not found");
      return;
    }

    const updated = db.update("ai_conversations", id, { title });

    this.ok(res, updated);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = conversationIdSchema.parse(req.params);
    const userId = req.user?.id;

    const conversation = userId
      ? db.findOne<Conversation>("ai_conversations", { id, user_id: userId })
      : null;

    if (!conversation) {
      this.notFound(res, "Conversation not found");
      return;
    }

    db.delete("ai_conversations", id);

    if (userId) {
      logActivity(userId, "ai_conversation_deleted", "ai_conversation", id);
    }

    this.noContent(res);
  });
}

export const aiConversationController = new AiConversationController();
