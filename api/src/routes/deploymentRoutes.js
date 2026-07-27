
import { Router } from "express";

import {
    createDeployment,
    getDeployments,
    getDeployment,
    pairDeployment,
    startDeployment,
    stopDeployment,
    deleteDeployment
} from "../controllers/deploymentController.js";

import auth from "../middleware/auth.js";

import * as botEngineService from "../services/botEngineService.js";


const router = Router();


// GET ALL DEPLOYMENTS
router.get(
    "/list",
    auth,
    getDeployments
);


// GET SINGLE DEPLOYMENT
router.get(
    "/:id",
    auth,
    getDeployment
);


// CREATE DEPLOYMENT
router.post(
    "/create",
    auth,
    createDeployment
);


// PAIR DEPLOYMENT
router.post(
    "/:id/pair",
    auth,
    pairDeployment
);


// START DEPLOYMENT
router.post(
    "/:id/start",
    auth,
    startDeployment
);


// STOP DEPLOYMENT
router.post(
    "/:id/stop",
    auth,
    stopDeployment
);


// DELETE DEPLOYMENT
router.delete(
    "/:id",
    auth,
    deleteDeployment
);


// CREATE PAIRING CODE
router.post(
    "/:id/pairing-code",
    auth,
    async (req, res) => {

        try {

            const code =
                await botEngineService.createPairingCode(
                    req.params.id,
                    req.body.phoneNumber
                );


            res.json({

                success: true,

                code

            });


        } catch (error) {

            console.log(error);

            res.status(500).json({

                success: false,

                message: error.message

            });

        }

    }
);


export default router;

