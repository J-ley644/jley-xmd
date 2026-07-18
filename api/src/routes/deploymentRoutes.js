import { Router } from "express";
import {
    createDeployment,
    getDeployments,
    pairDeployment,
    startDeployment,
    stopDeployment,
    deleteDeployment
} from "../controllers/deploymentController.js";

import auth from "../middleware/auth.js";

const router = Router();

router.get("/", auth, getDeployments);

router.post("/create", auth, createDeployment);

router.post("/:id/pair", auth, pairDeployment);

router.post("/:id/start", auth, startDeployment);


router.post("/:id/stop", auth, stopDeployment);
router.delete(
    "/:id",
    auth,
    deleteDeployment
);

export default router;