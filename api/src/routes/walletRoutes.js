import { Router } from "express";

import auth from "../middleware/auth.js";

import {
    getMyWallet
} from "../controllers/walletController.js";


const router = Router();


router.get(
    "/me",
    auth,
    getMyWallet
);


export default router;