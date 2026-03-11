import { Response } from "express";
import { z } from "zod";
import { BaseController, asyncHandler } from "../controllers/base.js";
import { db } from "../lib/db.js";
import { AuthRequest } from "../middleware/auth.js";

const journalSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1),
  mood: z.string().optional(),
  tags: z.string().optional(),
  entry_date: z.string(),
});

class JournalController extends BaseController {
  getAll = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const entries = db.findMany("journal_entries", {});
    this.ok(res, entries);
  });

  getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const date = req.params.date;
    const entries = db.findMany("journal_entries", { entry_date: date });
    this.ok(res, entries);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const entry = db.findOne("journal_entries", { id });
    if (!entry) {
      this.notFound(res, "Journal entry not found");
      return;
    }
    this.ok(res, entry);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = journalSchema.parse(req.body);
    const entry = db.create("journal_entries", {
      ...data,
      user_id: req.user?.id || null,
    });
    this.created(res, entry);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    const data = journalSchema.partial().parse(req.body);
    const entry = db.update("journal_entries", id, data);
    if (!entry) {
      this.notFound(res, "Journal entry not found");
      return;
    }
    this.ok(res, entry);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id);
    db.delete("journal_entries", id);
    this.noContent(res);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    
    // Get journal entries for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    let entries;
    if (userId) {
      entries = db.query(
        "SELECT * FROM journal_entries WHERE user_id = ? AND entry_date >= ?",
        [userId, dateStr]
      );
    } else {
      entries = db.query(
        "SELECT * FROM journal_entries WHERE entry_date >= ?",
        [dateStr]
      );
    }

    const count = entries.length;
    this.ok(res, { count });
  });
}

export const journalController = new JournalController();
