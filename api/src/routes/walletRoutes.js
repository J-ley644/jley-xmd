import { Router } from "express";
import auth from "../middleware/auth.js";
import * as walletController from "../controllers/walletController.js";

const router = Router();

router.use(auth);

router.get("/", walletController.balance);
router.get("/transactions", walletController.transactions);

export default router;
