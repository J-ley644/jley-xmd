import prisma from "../config/prisma.js";

import * as deploymentManager from "./deploymentManager.js";

import { stopBotEngine } from "./botEngineService.js";

 /*                                                                         |
| -------------------------------------------------------------------------- |
| DEPLOYMENT EXPIRY CHECKER                                                  |
| -------------------------------------------------------------------------- |
|                                                                            |
| Checks every minute for deployments whose 32-day lifespan has expired.     |
|                                                                            |
| */                                                                         

const CHECK_INTERVAL =
60 * 1000;

 /*                                                                         |
| -------------------------------------------------------------------------- |
| CHECK EXPIRED DEPLOYMENTS                                                  |
| -------------------------------------------------------------------------- |
| */                                                                         

async function checkExpiredDeployments() {


try {

    const now =
        new Date();


    const expiredDeployments =
        await prisma.deployment.findMany({

            where: {

                expiresAt: {

                    lte: now

                },

                status: "RUNNING"

            },

            select: {

                id: true,

                botName: true,

                ownerId: true,

                expiresAt: true

            }

        });


    if (
        expiredDeployments.length === 0
    ) {

        return;

    }


    for (
        const deployment
        of expiredDeployments
    ) {

        console.log(
            `⏰ Deployment expired: ${deployment.id}`
        );


        try {

            /*
            |--------------------------------------------------------------------------
            | Stop active bot engine
            |--------------------------------------------------------------------------
            */

            if (
                deploymentManager.isRunning(
                    deployment.id
                )
            ) {

                await stopBotEngine(
                    deployment.id
                );

            } else {

                /*
                |--------------------------------------------------------------------------
                | Bot isn't in memory, but make sure DB is stopped.
                |--------------------------------------------------------------------------
                */

                await prisma.deployment.update({

                    where: {

                        id:
                            deployment.id

                    },

                    data: {

                        status:
                            "STOPPED",

                        connectionStatus:
                            "OFFLINE",

                        sessionReady:
                            false

                    }

                });

            }


            console.log(
                `🛑 Expired bot stopped: ${deployment.botName}`
            );


        } catch (error) {

            console.error(

                `FAILED TO STOP EXPIRED DEPLOYMENT ${deployment.id}:`,

                error

            );

        }

    }


} catch (error) {

    console.error(
        "DEPLOYMENT EXPIRY CHECK ERROR:",
        error
    );

}


}

 /*                                                                         |
| -------------------------------------------------------------------------- |
| START EXPIRY CHECKER                                                       |
| -------------------------------------------------------------------------- |
| */                                                                         

export function startDeploymentExpiryChecker() {


console.log(
    "⏰ Deployment expiry checker started"
);


/*
|--------------------------------------------------------------------------
| Check immediately when API starts
|--------------------------------------------------------------------------
*/

checkExpiredDeployments();


/*
|--------------------------------------------------------------------------
| Continue checking every minute
|--------------------------------------------------------------------------
*/

setInterval(

    checkExpiredDeployments,

    CHECK_INTERVAL

);


}

 /*                                                                         |
| -------------------------------------------------------------------------- |
| EXPORTS                                                                    |
| -------------------------------------------------------------------------- |
| */                                                                         

export {
checkExpiredDeployments
};
