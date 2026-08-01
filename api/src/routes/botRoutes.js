import { Router } from "express";

import auth from "../middleware/auth.js";

import {
    list,
    getBot,
    stop
} from "../controllers/botController.js";


const router = Router();


router.use(auth);


router.get(
    "/",
    list
);


router.get(
    "/:id",
    getBot
);


router.post(
    "/:id/stop",
    stop
);


export default router;
