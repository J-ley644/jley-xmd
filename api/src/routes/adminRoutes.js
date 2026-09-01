import { Router } from "express";

import auth from "../middleware/auth.js";
import admin from "../middleware/admin.js";

import {
    getUsers,
    creditUserWallet,
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


router.post(
    "/users/credit",
    creditUserWallet
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