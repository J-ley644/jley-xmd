import { Router } from "express";
import auth from "../middleware/auth.js";
import { getClientDashboard } from "../controllers/clientDashboardController.js";

const router = Router();

router.get(
    "/dashboard",
    auth,
    getClientDashboard
);

export default router;