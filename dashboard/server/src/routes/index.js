import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| API Status
|--------------------------------------------------------------------------
*/

router.get("/", (req, res) => {
    res.json({
        success: true,
        name: "JLEY-XMD Dashboard API",
        version: "1.0.0",
        status: "running"
    });
});

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.use("/auth", authRoutes);

export default router;