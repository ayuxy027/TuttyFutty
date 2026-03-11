import { Router } from "express";
import healthRoutes from "./Health.js";
import authRoutes from "./Auth.js";
import aiRoutes from "./Ai.js";
import aiConversationRoutes from "./AiConversation.js";
import userSessionRoutes from "./UserSession.js";
import goalRoutes from "./Goal.js";
import taskRoutes from "./Task.js";
import habitRoutes from "./Habit.js";
import journalRoutes from "./Journal.js";
import flashcardRoutes from "./Flashcard.js";
import sessionRoutes from "./Session.js";
import dailyPlanRoutes from "./DailyPlan.js";

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
