import { Router } from "express";

import {
    register,
    login,
    profile,
    updateProfile,
    changePassword
} from "../controllers/auth.controller.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

router.post("/register", register);

router.post("/login", login);

router.get("/profile", profile);

router.put("/profile", updateProfile);

router.put("/password", changePassword);

export default router;