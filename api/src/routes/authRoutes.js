import { Router } from "express";
import * as authController from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth, authController.me);

export default router;
