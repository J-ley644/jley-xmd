import { Router } from "express";
import auth from "../middleware/auth.js";
import prisma from "../config/prisma.js";
import {
    startDeployment,
    stopDeployment,
    deleteDeployment,
    createDeployment
} from "../services/deploymentService.js";


const router = Router();


// GET CLIENT BOTS
router.get("/", auth, async (req, res) => {

    try {

        const bots =
            await prisma.deployment.findMany({

                where: {
                    ownerId: req.user.id
                },

                orderBy: {
                    createdAt: "desc"
                }

            });


        res.json({

            success: true,

            bots

        });


    } catch(error) {

        console.log(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});



// DEPLOY NEW BOT
router.post("/deploy", auth, async (req,res)=>{

    try {


        const deployment =
            await createDeployment({

                botName:req.body.botName,

                ownerId:req.user.id

            });


        res.json({

            success:true,

            deployment

        });


    } catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});



// START BOT
router.post("/:id/start", auth, async(req,res)=>{

    try {


        const bot =
            await startDeployment(
                req.params.id
            );


        res.json({

            success:true,

            bot

        });


    }catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});



// STOP BOT
router.post("/:id/stop", auth, async(req,res)=>{

    try {


        const bot =
            await stopDeployment(
                req.params.id
            );


        res.json({

            success:true,

            bot

        });


    }catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});



// DELETE BOT
router.delete("/:id", auth, async(req,res)=>{

    try {


        await deleteDeployment(
            req.params.id
        );


        res.json({

            success:true,

            message:"Bot deleted"

        });


    }catch(error){

        console.log(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

});


export default router;