import { Router } from "express";
import { userSessionController } from "../controllers/Index.js";
import { authMiddleware } from "../middleware/auth.js";
import { validateParams } from "../middleware/index.js";
import { z } from "zod";

const router = Router();

const sessionIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

router.get("/", authMiddleware, userSessionController.getAll);
router.get("/current", authMiddleware, userSessionController.getCurrent);
router.get("/stats", authMiddleware, userSessionController.getStats);
router.get("/:id", authMiddleware, validateParams(sessionIdSchema), userSessionController.getById);
router.post("/start", authMiddleware, userSessionController.startSession);
router.post("/heartbeat", authMiddleware, userSessionController.updateActivity);
router.post("/end", authMiddleware, userSessionController.endSession);
router.post("/:id/activity", authMiddleware, validateParams(sessionIdSchema), userSessionController.updateActivityById);
router.post("/:id/end", authMiddleware, validateParams(sessionIdSchema), userSessionController.endSessionById);

export default router;
