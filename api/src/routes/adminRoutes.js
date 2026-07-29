import { Router } from "express";

import admin from "../middleware/admin.js";

import {
    getDashboardStats,
    getClients
} from "../controllers/adminController.js";


const router = Router();


router.get(
    "/dashboard",
    admin,
    getDashboardStats
);


router.get(
    "/clients",
    admin,
    getClients
);


export default router;