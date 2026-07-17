import prisma from "../config/prisma.js";


export async function getDeployments(req, res) {

    try {

        const deployments = await prisma.deployment.findMany({
            orderBy: {
                createdAt: "desc"
            }
        });


        res.json(deployments);


    } catch (error) {

        console.log(error);

        res.status(500).json({
            error: "Failed to fetch deployments"
        });

    }

}



import { deductJL } from "../services/walletService.js";


export async function createDeployment(req,res){

    try {


        const {
            botName,
            ownerId
        } = req.body;


        const jlCost = 50;


        await deductJL(
            ownerId,
            jlCost
        );


        const deployment = await prisma.deployment.create({

            data:{

                botName,

                jlCost,

                ownerId,

                status:"PENDING"

            }

        });



        res.json({

            message:"Deployment created",

            deployment

        });



    } catch(error){


        console.log(error);


        res.status(400).json({

            error:error.message

        });


    }

}