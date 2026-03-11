import { Router } from "express";
import { flashcardController } from "../controllers/index.js";
import { validateBody, validateParams } from "../middleware/index.js";
import { optionalAuthMiddleware } from "../middleware/auth.js";
import { z } from "zod";

const router = Router();

const flashcardSchema = z.object({
  deck_name: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  difficulty: z.number().int().min(0).max(5).optional(),
});

const flashcardIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createManySchema = z.object({
  deck_name: z.string().min(1),
  cards: z.array(z.object({
    front: z.string().min(1),
    back: z.string().min(1),
    difficulty: z.number().int().min(0).max(5).optional(),
  })),
});

router.get("/", optionalAuthMiddleware, flashcardController.getAll);
router.get("/decks", optionalAuthMiddleware, flashcardController.getDecks);
router.get("/deck/:deckName", optionalAuthMiddleware, validateParams(z.object({ deckName: z.string() })), flashcardController.getByDeck);
router.get("/:id", optionalAuthMiddleware, validateParams(flashcardIdSchema), flashcardController.getById);
router.post("/", optionalAuthMiddleware, validateBody(flashcardSchema), flashcardController.create);
router.post("/bulk", optionalAuthMiddleware, validateBody(createManySchema), flashcardController.createMany);
router.patch("/:id", optionalAuthMiddleware, validateParams(flashcardIdSchema), validateBody(flashcardSchema.partial()), flashcardController.update);
router.delete("/:id", optionalAuthMiddleware, validateParams(flashcardIdSchema), flashcardController.delete);
router.delete("/deck/:deckName", optionalAuthMiddleware, validateParams(z.object({ deckName: z.string() })), flashcardController.deleteDeck);

export default router;
