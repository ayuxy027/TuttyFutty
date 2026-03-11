import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";
import { aiService } from "../lib/aiService.js";

const flashcardSchema = z.object({
  deck_name: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  difficulty: z.number().int().min(0).max(5).optional(),
  card_date: z.string().optional(),
});

const generateSchema = z.object({
  topic: z.string().min(1),
  count: z.number().int().min(1).max(20).default(5),
  deck_name: z.string().min(1),
  card_date: z.string().optional(),
});

class FlashcardController extends BaseController {
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const cards = db.findMany("flashcards", {});
    this.ok(res, cards);
  });

  getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.params.date;
    const cards = db.findMany("flashcards", { card_date: date });
    this.ok(res, cards);
  });

  getDates = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const cards = db.findMany("flashcards", {}) as Array<{ card_date?: string }>;
    const dates = [...new Set(cards.map((c) => c.card_date || "").filter(Boolean))];
    this.ok(res, dates);
  });

  getDecks = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const cards = db.findMany("flashcards", {}) as Array<{ deck_name?: string }>;
    const decks = [...new Set(cards.map((c) => c.deck_name || "").filter(Boolean))];
    this.ok(res, decks);
  });

  getByDeck = asyncHandler(async (req: AuthRequest, res: Response) => {
    const deckName = req.params.deckName;
    const cards = db.findMany("flashcards", { deck_name: deckName });
    this.ok(res, cards);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const card = db.findOne("flashcards", { id });
    if (!card) {
      this.notFound(res, "Flashcard not found");
      return;
    }
    this.ok(res, card);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = flashcardSchema.parse(req.body);
    const card = db.create("flashcards", {
      ...data,
      user_id: req.user?.id || null,
    });
    this.created(res, card);
  });

  generate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { topic, count, deck_name, card_date } = generateSchema.parse(req.body);
    
    const result = await aiService.generateFlashcards(topic, count);
    
    if (!result.success || !result.flashcards) {
      this.error(res, result.error || "Failed to generate flashcards", 500);
      return;
    }

    const today = card_date || new Date().toISOString().split("T")[0];
    const createdCards = [];
    
    for (const fc of result.flashcards) {
      const created = db.create("flashcards", {
        deck_name,
        front: fc.front,
        back: fc.back,
        difficulty: Math.floor(Math.random() * 3) + 1,
        card_date: today,
        user_id: req.user?.id || null,
      });
      createdCards.push(created);
    }

    this.created(res, createdCards);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const data = flashcardSchema.partial().parse(req.body);
    const card = db.update("flashcards", id, {
      ...data,
      last_reviewed: new Date().toISOString(),
    });
    if (!card) {
      this.notFound(res, "Flashcard not found");
      return;
    }
    this.ok(res, card);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    db.delete("flashcards", id);
    this.noContent(res);
  });

  createMany = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { deck_name, cards, card_date } = req.body;
    const today = card_date || new Date().toISOString().split("T")[0];
    const createdCards = [];
    for (const card of cards) {
      const created = db.create("flashcards", {
        deck_name,
        front: card.front,
        back: card.back,
        difficulty: card.difficulty || 0,
        card_date: today,
        user_id: req.user?.id || null,
      });
      createdCards.push(created);
    }
    this.created(res, createdCards);
  });

  deleteDeck = asyncHandler(async (req: AuthRequest, res: Response) => {
    const deckName = req.params.deckName;
    const cards = db.findMany("flashcards", { deck_name: deckName }) as Array<{ id: number }>;
    for (const card of cards) {
      db.delete("flashcards", card.id);
    }
    this.noContent(res);
  });
}

export const flashcardController = new FlashcardController();
