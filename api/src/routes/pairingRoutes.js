import { Router } from "express";

import auth from "../middleware/auth.js";

import {
    startPairing,
    generatePairingCode,
    getPairingStatus,
    stopPairing
} from "../controllers/pairingController.js";


const router = Router();


router.use(auth);


router.post(
    "/:id/start",
    startPairing
);


router.get(
    "/:id/status",
    getPairingStatus
);

router.post(
    "/:id/code",
    generatePairingCode
);


router.post(
    "/:id/stop",
    stopPairing
);


export default router;
