import { Router } from "express";
import { healthController } from "../controllers/index.js";

const router = Router();

router.get("/health", healthController.check);

export default router;
