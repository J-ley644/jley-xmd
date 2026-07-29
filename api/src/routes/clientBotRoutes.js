
import { Router } from "express";
import auth from "../middleware/auth.js";

import {
    createClientBot,
    getClientBots,
    getClientDashboard,
    getClientDeployment
} from "../controllers/clientBotController.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Client Authentication
|--------------------------------------------------------------------------
*/

router.use(auth);

/*
|--------------------------------------------------------------------------
| Client Dashboard
|--------------------------------------------------------------------------
*/

router.get(
    "/dashboard",
    getClientDashboard
);

/*
|--------------------------------------------------------------------------
| Client Deployments
|--------------------------------------------------------------------------
*/

router.post(
    "/deploy",
    createClientBot
);

router.get(
    "/bots",
    getClientBots
);

router.get(
    "/deploy/:id",
    getClientDeployment
);

export default router;

