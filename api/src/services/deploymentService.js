import prisma from "../config/prisma.js";

import * as deploymentManager from "./deploymentManager.js";

import {
    startBotEngine,
    stopBotEngine
} from "./botEngineService.js";


/*
|--------------------------------------------------------------------------
| DEPLOYMENT LIFESPAN
|--------------------------------------------------------------------------
*/

const DEPLOYMENT_LIFESPAN_DAYS = 32;


/*
|--------------------------------------------------------------------------
| GET DEPLOYMENTS
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| CREATE DEPLOYMENT
|--------------------------------------------------------------------------
|
| Creating a deployment does NOT start the 32-day clock.
|
| The clock begins when WhatsApp successfully connects for the
| first time inside whatsapp.js.
|
|--------------------------------------------------------------------------
*/

export async function createDeployment(data) {

    return await prisma.deployment.create({

        data: {

            botName: data.botName,

            ownerId: data.ownerId,

            jlCost: 50,

            status: "PENDING",

            activatedAt: null,

            expiresAt: null,

            connectionStatus: "OFFLINE",

            sessionReady: false

        }

    });

}


/*
|--------------------------------------------------------------------------
| START DEPLOYMENT
|--------------------------------------------------------------------------
*/

export async function startDeployment(
    id,
    ownerId
) {

    const deployment =
        await prisma.deployment.findFirst({

            where: {
                id,
                ownerId
            }

        });


    if (!deployment) {

        throw new Error(
            "Deployment not found"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | EXPIRED DEPLOYMENT PROTECTION
    |--------------------------------------------------------------------------
    */

    if (
        deployment.expiresAt &&
        deployment.expiresAt <= new Date()
    ) {

        await prisma.deployment.update({

            where: {
                id
            },

            data: {

                status: "STOPPED",

                connectionStatus: "OFFLINE",

                sessionReady: false

            }

        });


        throw new Error(
            "Deployment has expired."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | PREVENT DUPLICATE START
    |--------------------------------------------------------------------------
    */

    if (
        deploymentManager.isRunning(id)
    ) {

        return deploymentManager.getBot(id);

    }


    /*
    |--------------------------------------------------------------------------
    | START BOT
    |--------------------------------------------------------------------------
    */

    const botInstance =
        await startBotEngine(
            deployment
        );


    /*
    |--------------------------------------------------------------------------
    | STATUS UPDATE
    |--------------------------------------------------------------------------
    */

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


/*
|--------------------------------------------------------------------------
| STOP DEPLOYMENT
|--------------------------------------------------------------------------
*/

export async function stopDeployment(
    id,
    ownerId
) {

    const deployment =
        await prisma.deployment.findFirst({

            where: {
                id,
                ownerId
            }

        });


    if (!deployment) {

        throw new Error(
            "Deployment not found"
        );

    }


    await stopBotEngine(id);


    return await prisma.deployment.update({

        where: {
            id
        },

        data: {

            status: "STOPPED",

            connectionStatus: "OFFLINE",

            sessionReady: false

        }

    });

}


/*
|--------------------------------------------------------------------------
| GET SINGLE DEPLOYMENT
|--------------------------------------------------------------------------
*/

export async function getDeployment(
    id,
    ownerId
) {

    return await prisma.deployment.findFirst({

        where: {

            id,

            ownerId

        }

    });

}


/*
|--------------------------------------------------------------------------
| UPDATE DEPLOYMENT STATUS
|--------------------------------------------------------------------------
*/

export async function updateDeploymentStatus(
    id,
    status,
    ownerId
) {

    const deployment =
        await prisma.deployment.findFirst({

            where: {
                id,
                ownerId
            }

        });


    if (!deployment) {

        throw new Error(
            "Deployment not found"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | NEVER ALLOW EXPIRED DEPLOYMENT TO RUN
    |--------------------------------------------------------------------------
    */

    if (
        status === "RUNNING" &&
        deployment.expiresAt &&
        deployment.expiresAt <= new Date()
    ) {

        throw new Error(
            "Deployment has expired."
        );

    }


    return await prisma.deployment.update({

        where: {
            id
        },

        data: {
            status
        }

    });

}


/*
|--------------------------------------------------------------------------
| DELETE DEPLOYMENT
|--------------------------------------------------------------------------
*/

export async function deleteDeployment(
    id
) {

    /*
    Stop the WhatsApp engine first.
    */

    await stopBotEngine(id);


    /*
    Remove from deployment manager.
    */

    deploymentManager.removeBot(id);


    /*
    Delete database record.
    */

    return await prisma.deployment.delete({

        where: {
            id
        }

    });

}


/*
|--------------------------------------------------------------------------
| LIFESPAN HELPERS
|--------------------------------------------------------------------------
*/

export function getDeploymentLifespanDays() {

    return DEPLOYMENT_LIFESPAN_DAYS;

}