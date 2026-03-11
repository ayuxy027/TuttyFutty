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
  getAll = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, []);
      return;
    }
    const entries = db.query("SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC", userId);
    this.ok(res, entries);
  });

  getByDate = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, []);
      return;
    }
    const date = req.params.date;
    const entries = db.query("SELECT * FROM journal_entries WHERE user_id = ? AND entry_date = ?", [userId, date]);
    this.ok(res, entries);
  });

  getById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Journal entry not found");
      return;
    }
    const id = parseInt(req.params.id);
    const entry = db.findOne("journal_entries", { id, user_id: userId });
    if (!entry) {
      this.notFound(res, "Journal entry not found");
      return;
    }
    this.ok(res, entry);
  });

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.unauthorized(res, "Authentication required");
      return;
    }
    const data = journalSchema.parse(req.body);
    const entry = db.create("journal_entries", {
      ...data,
      user_id: userId,
    });
    this.created(res, entry);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Journal entry not found");
      return;
    }
    const id = parseInt(req.params.id);
    const existing = db.findOne("journal_entries", { id, user_id: userId });
    if (!existing) {
      this.notFound(res, "Journal entry not found");
      return;
    }
    const data = journalSchema.partial().parse(req.body);
    const entry = db.update("journal_entries", id, data);
    this.ok(res, entry);
  });

  delete = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.notFound(res, "Journal entry not found");
      return;
    }
    const id = parseInt(req.params.id);
    const existing = db.findOne("journal_entries", { id, user_id: userId });
    if (!existing) {
      this.notFound(res, "Journal entry not found");
      return;
    }
    db.delete("journal_entries", id);
    this.noContent(res);
  });

  getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      this.ok(res, { count: 0 });
      return;
    }
    
    // Get journal entries for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateStr = sevenDaysAgo.toISOString().split('T')[0];

    const entries = db.query(
      "SELECT * FROM journal_entries WHERE user_id = ? AND entry_date >= ?",
      [userId, dateStr]
    );

    const count = entries.length;
    this.ok(res, { count });
  });
}

export const journalController = new JournalController();
