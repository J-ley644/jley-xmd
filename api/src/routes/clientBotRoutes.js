import { Router } from "express";
import auth from "../middleware/auth.js";

import {
    createClientBot,
    getClientBots
} from "../controllers/clientBotController.js";
import prisma from "../config/prisma.js";


const router = Router();



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
    async (req, res) => {

        try {

            const deployment =
                await prisma.deployment.findUnique({

                    where: {
                        id: req.params.id
                    }

                });

            if (!deployment) {

                return res.status(404).json({
                    success: false,
                    message: "Deployment not found."
                });

            }

            res.json({
                success: true,
                deployment
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