import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";

const flashcardSchema = z.object({
  deck_name: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  difficulty: z.number().int().min(0).max(5).optional(),
});

class FlashcardController extends BaseController {
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const cards = db.findMany("flashcards", {});
    this.ok(res, cards);
  });

  getDecks = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const cards = db.findMany("flashcards", {});
    const decks = [...new Set(cards.map((c: { deck_name: string }) => c.deck_name))];
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
    const { deck_name, cards } = req.body;
    const createdCards = [];
    for (const card of cards) {
      const created = db.create("flashcards", {
        deck_name,
        front: card.front,
        back: card.back,
        difficulty: card.difficulty || 0,
        user_id: req.user?.id || null,
      });
      createdCards.push(created);
    }
    this.created(res, createdCards);
  });

  deleteDeck = asyncHandler(async (req: AuthRequest, res: Response) => {
    const deckName = req.params.deckName;
    const cards = db.findMany("flashcards", { deck_name: deckName });
    for (const card of cards) {
      db.delete("flashcards", card.id);
    }
    this.noContent(res);
  });
}

export const flashcardController = new FlashcardController();
