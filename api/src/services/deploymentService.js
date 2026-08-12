
import prisma from "../config/prisma.js";

import {
    startDeploymentSession,
    getDeploymentStatus,
    stopDeploymentSession
} from "./whatsapp/index.js";

const DEPLOYMENT_LIFESPAN_DAYS = 32;

const JL_DEPLOYMENT_COST = 50;


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


    if (wallet.balance < JL_DEPLOYMENT_COST) {
        throw new Error(
            `Insufficient JL balance. You need ${JL_DEPLOYMENT_COST} JL.`
        );
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


    return await prisma.$transaction(
        async (tx) => {

            const updatedWallet =
                await tx.wallet.update({
                    where: {
                        userId
                    },
                    data: {
                        balance: {
                            decrement: JL_DEPLOYMENT_COST
                        }
                    }
                });


            const deployment =
                await tx.deployment.create({
                    data: {
                        botName: botName.trim(),
                        jlCost: JL_DEPLOYMENT_COST,
                        ownerId: userId,
                        status: "PENDING",
                        connectionStatus: "OFFLINE",
                        sessionReady: false,
                        expiresAt
                    }
                });


            return {
                deployment,
                wallet: updatedWallet
            };

        }
    );
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
        throw new Error(
            "Deployment not found."
        );
    }


    /*
     * Do not allow expired deployments
     * to start.
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


    /*
     * IMPORTANT:
     *
     * WhatsApp constants use uppercase values:
     *
     * CONNECTING
     * QR_READY
     * CONNECTED
     * OFFLINE
     *
     * Do not compare against lowercase strings.
     */

    const sessionStatus =
        String(
            session?.status || "OFFLINE"
        ).toUpperCase();


    const isConnected =
        sessionStatus === "CONNECTED";


    const isStopped =
        sessionStatus === "OFFLINE";


    const updatedDeployment =
        await prisma.deployment.update({
            where: {
                id: deployment.id
            },
            data: {

                status:
                    isConnected
                        ? "RUNNING"
                        : deployment.status === "STOPPED"
                            ? "STOPPED"
                            : "PENDING",

                connectionStatus:
                    sessionStatus,

                sessionReady:
                    isConnected,

                lastConnected:
                    isConnected
                        ? new Date()
                        : deployment.lastConnected

            }
        });


    return {
        deployment: updatedDeployment,

        session: {
            deploymentId: deployment.id,

            status: sessionStatus,

            qr:
                session?.qr || null
        }
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
        throw new Error(
            "Deployment not found."
        );
    }


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


    const sessionStatus =
        String(
            session?.status || "OFFLINE"
        ).toUpperCase();


    /*
     * If the live WhatsApp session says CONNECTED,
     * make sure the database reflects it.
     */

    if (
        sessionStatus === "CONNECTED" &&
        deployment.status !== "RUNNING"
    ) {

        await prisma.deployment.update({
            where: {
                id: deployment.id
            },
            data: {
                status: "RUNNING",
                connectionStatus: "CONNECTED",
                sessionReady: true,
                lastConnected: new Date()
            }
        });


        deployment.status = "RUNNING";
        deployment.connectionStatus = "CONNECTED";
        deployment.sessionReady = true;
    }


    return {
        deployment,

        session: {
            status: sessionStatus,

            qr:
                session?.qr || null
        }
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


        const sessionStatus =
            String(
                session?.status || "OFFLINE"
            ).toUpperCase();


        const connected =
            sessionStatus === "CONNECTED";


        /*
         * Keep database synchronized with
         * the actual live WhatsApp socket.
         */

        if (
            connected &&
            deployment.status !== "RUNNING"
        ) {

            await prisma.deployment.update({
                where: {
                    id: deployment.id
                },

                data: {
                    status: "RUNNING",
                    connectionStatus: "CONNECTED",
                    sessionReady: true,
                    lastConnected: new Date()
                }
            });


            deployment.status = "RUNNING";
            deployment.connectionStatus = "CONNECTED";
            deployment.sessionReady = true;
            deployment.lastConnected = new Date();
        }


        const daysRemaining =
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
                : null;


        results.push({

            id:
                deployment.id,

            botName:
                deployment.botName,

            status:
                deployment.status,

            connectionStatus:
                deployment.status === "STOPPED"
                    ? "OFFLINE"
                    : sessionStatus,

            sessionReady:
                deployment.status !== "STOPPED" &&
                connected,

            lastConnected:
                deployment.lastConnected ||
                null,

            createdAt:
                deployment.createdAt,

            expiresAt:
                deployment.expiresAt,

            daysRemaining

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

