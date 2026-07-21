import prisma from "../config/prisma.js";

import * as deploymentManager from "./deploymentManager.js";

import {
    startBotEngine,
    stopBotEngine
} from "./botEngineService.js";



export async function getDeployments(ownerId) {

    return await prisma.deployment.findMany({

        where: {
            ownerId
        },

        orderBy: {
            createdAt: "desc"
        }

    });

}





export async function createDeployment(data) {

    return await prisma.deployment.create({

        data: {

            botName: data.botName,

            ownerId: data.ownerId,

            jlCost: 50,

            status: "PENDING"

        }

    });

}





export async function startDeployment(id) {


    const deployment =
        await prisma.deployment.findUnique({

            where: {
                id
            }

        });



    if (!deployment) {

        throw new Error(
            "Deployment not found"
        );

    }



    const botInstance =
        await startBotEngine(
            deployment
        );



    await prisma.deployment.update({

        where: {
            id
        },

        data: {

            status: "RUNNING"

        }

    });



    return botInstance;

}





export async function stopDeployment(id) {


    stopBotEngine(id);



    return await prisma.deployment.update({

        where: {
            id
        },

        data: {

            status: "STOPPED"

        }

    });

}





export async function getDeployment(id) {


    return await prisma.deployment.findUnique({

        where: {
            id
        }

    });

}





export async function updateDeploymentStatus(
    id,
    status
) {


    return await prisma.deployment.update({

        where: {
            id
        },

        data: {

            status

        }

    });

}


export async function deleteDeployment(id) {


    stopBotEngine(id);


    deploymentManager.removeBot(id);



    return await prisma.deployment.delete({

        where: {
            id
        }

    });

}