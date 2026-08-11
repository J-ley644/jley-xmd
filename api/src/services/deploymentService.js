
import prisma from "../config/prisma.js";

import {
    startDeploymentSession,
    getDeploymentStatus,
    stopDeploymentSession
} from "./whatsapp/index.js";


const DEPLOYMENT_LIFESPAN_DAYS = 32;


/*
|--------------------------------------------------------------------------
| CREATE DEPLOYMENT
|--------------------------------------------------------------------------
*/

export async function createDeployment(
    userId,
    botName
) {

    const wallet =
        await prisma.wallet.findUnique({
            where: {
                userId
            }
        });

    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    const jlCost = 1;

    if (wallet.balance < jlCost) {
        throw new Error("Insufficient JL balance.");
    }


    const expiresAt =
        new Date(
            Date.now() +
            DEPLOYMENT_LIFESPAN_DAYS *
            24 *
            60 *
            60 *
            1000
        );


    const result =
        await prisma.$transaction(
            async (tx) => {

                const updatedWallet =
                    await tx.wallet.update({
                        where: {
                            userId
                        },
                        data: {
                            balance: {
                                decrement: jlCost
                            }
                        }
                    });


                const deployment =
                    await tx.deployment.create({
                        data: {
                            botName,
                            jlCost,
                            ownerId: userId,
                            status: "PENDING",
                            expiresAt
                        }
                    });


                return {
                    deployment,
                    wallet: updatedWallet
                };

            }
        );


    return result;
}


/*
|--------------------------------------------------------------------------
| START DEPLOYMENT
|--------------------------------------------------------------------------
*/

export async function startDeployment(
    userId,
    deploymentId
) {

    const deployment =
        await prisma.deployment.findFirst({
            where: {
                id: deploymentId,
                ownerId: userId
            }
        });


    if (!deployment) {
        throw new Error("Deployment not found.");
    }


    /*
     * Prevent expired deployments from starting.
     */

    if (
        deployment.expiresAt &&
        deployment.expiresAt <= new Date()
    ) {

        await stopDeploymentSession(
            deployment.id
        ).catch(() => {});


        await prisma.deployment.update({
            where: {
                id: deployment.id
            },
            data: {
                status: "STOPPED",
                connectionStatus: "OFFLINE",
                sessionReady: false
            }
        });


        throw new Error(
            "This deployment has expired."
        );
    }


    const session =
        await startDeploymentSession(
            deployment.id
        );


    const updatedDeployment =
        await prisma.deployment.update({
            where: {
                id: deployment.id
            },
            data: {
                status:
                    session.status === "connected"
                        ? "RUNNING"
                        : "PENDING",

                connectionStatus:
                    session.status?.toUpperCase() ||
                    "OFFLINE",

                sessionReady:
                    session.status === "connected",

                lastConnected:
                    session.status === "connected"
                        ? new Date()
                        : deployment.lastConnected
            }
        });


    return {
        deployment: updatedDeployment,
        session
    };
}


/*
|--------------------------------------------------------------------------
| GET SINGLE DEPLOYMENT
|--------------------------------------------------------------------------
*/

export async function getDeployment(
    userId,
    deploymentId
) {

    const deployment =
        await prisma.deployment.findFirst({
            where: {
                id: deploymentId,
                ownerId: userId
            }
        });


    if (!deployment) {
        throw new Error("Deployment not found.");
    }


    /*
     * Automatically mark expired deployments.
     */

    if (
        deployment.expiresAt &&
        deployment.expiresAt <= new Date() &&
        deployment.status !== "STOPPED"
    ) {

        await stopDeploymentSession(
            deployment.id
        ).catch(() => {});


        await prisma.deployment.update({
            where: {
                id: deployment.id
            },
            data: {
                status: "STOPPED",
                connectionStatus: "OFFLINE",
                sessionReady: false
            }
        });


        deployment.status = "STOPPED";
        deployment.connectionStatus = "OFFLINE";
        deployment.sessionReady = false;
    }


    const session =
        await getDeploymentStatus(
            deployment.id
        );


    return {
        deployment,
        session
    };
}


/*
|--------------------------------------------------------------------------
| LIST USER DEPLOYMENTS
|--------------------------------------------------------------------------
*/

export async function listDeployments(
    userId
) {

    const deployments =
        await prisma.deployment.findMany({
            where: {
                ownerId: userId
            },
            orderBy: {
                createdAt: "desc"
            }
        });


    const results = [];


    for (const deployment of deployments) {

        /*
         * Automatically stop expired deployments.
         */

        if (
            deployment.expiresAt &&
            deployment.expiresAt <= new Date() &&
            deployment.status !== "STOPPED"
        ) {

            await stopDeploymentSession(
                deployment.id
            ).catch(() => {});


            await prisma.deployment.update({
                where: {
                    id: deployment.id
                },
                data: {
                    status: "STOPPED",
                    connectionStatus: "OFFLINE",
                    sessionReady: false
                }
            });


            deployment.status = "STOPPED";
            deployment.connectionStatus = "OFFLINE";
            deployment.sessionReady = false;
        }


        const session =
            await getDeploymentStatus(
                deployment.id
            );


        results.push({

            id: deployment.id,

            botName:
                deployment.botName,

            status:
                deployment.status,

            connectionStatus:
                deployment.status === "STOPPED"
                    ? "OFFLINE"
                    : (
                        session.status?.toUpperCase() ||
                        "OFFLINE"
                    ),

            sessionReady:
                deployment.status !== "STOPPED" &&
                session.status === "connected",

            lastConnected:
                session.lastConnected ||
                deployment.lastConnected ||
                null,

            createdAt:
                deployment.createdAt,

            expiresAt:
                deployment.expiresAt,

            daysRemaining:
                deployment.expiresAt
                    ? Math.max(
                        0,
                        Math.ceil(
                            (
                                deployment.expiresAt.getTime() -
                                Date.now()
                            ) /
                            (1000 * 60 * 60 * 24)
                        )
                    )
                    : null

        });

    }


    return results;
}


/*
|--------------------------------------------------------------------------
| STOP DEPLOYMENT
|--------------------------------------------------------------------------
*/

export async function stopDeployment(
    userId,
    deploymentId
) {

    const deployment =
        await prisma.deployment.findFirst({
            where: {
                id: deploymentId,
                ownerId: userId
            }
        });


    if (!deployment) {
        throw new Error(
            "Deployment not found."
        );
    }


    await stopDeploymentSession(
        deployment.id
    );


    const updated =
        await prisma.deployment.update({
            where: {
                id: deployment.id
            },
            data: {
                status: "STOPPED",
                connectionStatus: "OFFLINE",
                sessionReady: false
            }
        });


    return updated;
}


/*
|--------------------------------------------------------------------------
| EXPIRE DEPLOYMENTS
|--------------------------------------------------------------------------
|
| This function is intended to be called periodically
| by the API server.
|
*/

export async function expireDeployments() {

    const now =
        new Date();


    const expired =
        await prisma.deployment.findMany({
            where: {
                expiresAt: {
                    lte: now
                },

                status: {
                    not: "STOPPED"
                }
            }
        });


    for (const deployment of expired) {

        try {

            await stopDeploymentSession(
                deployment.id
            );

        } catch (error) {

            console.error(
                `Failed to stop expired deployment ${deployment.id}:`,
                error.message
            );

        }


        await prisma.deployment.update({
            where: {
                id: deployment.id
            },
            data: {
                status: "STOPPED",
                connectionStatus: "OFFLINE",
                sessionReady: false
            }
        });

    }


    return expired.length;
}

