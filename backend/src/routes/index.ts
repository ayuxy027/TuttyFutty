import { Router } from "express";
import healthRoutes from "./health.js";
import authRoutes from "./auth.js";
import aiRoutes from "./ai.js";
import aiConversationRoutes from "./aiConversation.js";
import userSessionRoutes from "./userSession.js";
import goalRoutes from "./goal.js";
import taskRoutes from "./task.js";
import habitRoutes from "./habit.js";
import journalRoutes from "./journal.js";
import flashcardRoutes from "./flashcard.js";
import sessionRoutes from "./session.js";
import dailyPlanRoutes from "./dailyPlan.js";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/ai", aiRoutes);
router.use("/ai/conversations", aiConversationRoutes);
router.use("/sessions/tracking", userSessionRoutes);
router.use("/goals", goalRoutes);
router.use("/tasks", taskRoutes);
router.use("/habits", habitRoutes);
router.use("/journal", journalRoutes);
router.use("/flashcards", flashcardRoutes);
router.use("/sessions", sessionRoutes);
router.use("/plans", dailyPlanRoutes);

export default router;
