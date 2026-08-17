import { Router } from "express";

import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

import {
    getUsers,
    getJLSettings,
    updateJLSettings
} from "../controllers/adminController.js";


const router = Router();


router.use(auth);
router.use(admin);


/*
|--------------------------------------------------------------------------
| USERS
|--------------------------------------------------------------------------
*/

router.get(
    "/users",
    getUsers
);


/*
|--------------------------------------------------------------------------
| JL SETTINGS
|--------------------------------------------------------------------------
*/

router.get(
    "/settings/jl",
    getJLSettings
);


router.put(
    "/settings/jl",
    updateJLSettings
);


export default router;