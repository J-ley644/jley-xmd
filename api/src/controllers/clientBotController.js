import prisma from "../config/prisma.js";
import * as deploymentService from "../services/deploymentService.js";
import { startBotEngine } from "../services/botEngineService.js";



export async function createClientBot(req, res){

    try{


        const { botName } = req.body;


        if(!botName){

            return res.status(400).json({

                message:"Bot name required"

            });

        }



        const deployment =
            await deploymentService.createDeployment({

                botName,

                ownerId:"0e5a21f7-98bb-43b1-a082-3b67e7749671"

            });

            await startBotEngine(deployment);



        res.json({

            success:true,

            deployment

        });



    }catch(error){

        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

}





export async function getClientBots(req,res){

    try{


        const bots =
            await prisma.deployment.findMany({

                orderBy:{
                    createdAt:"desc"
                }

            });



        res.json({

            success:true,

            bots

        });



    }catch(error){

        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

}