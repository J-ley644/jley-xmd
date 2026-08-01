import prisma from "../config/prisma.js";

import {
    startDeploymentSession,
    getDeploymentStatus,
    stopDeploymentSession
} from "./whatsapp/index.js";;


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
                            status: "PENDING"
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

    const session =
        await startDeploymentSession(
            deployment.id
        );

    await prisma.deployment.update({
        where: {
            id: deployment.id
        },
        data: {
            status:
                session.status === "connected"
                    ? "RUNNING"
                    : "PENDING"
        }
    });

    return {
        deployment,
        session
    };
}


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

    const session =
        await getDeploymentStatus(
            deployment.id
        );

    return {
        deployment,
        session
    };
}


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

        const session =
            await getDeploymentStatus(
                deployment.id
            );

        results.push({
    id: deployment.id,
    botName: deployment.botName,
    status: deployment.status,

    connectionStatus:
        session.status?.toUpperCase() || "OFFLINE",

    sessionReady:
        session.status === "connected",

    lastConnected:
        session.lastConnected || null
});

    }

    return results;
}


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
        throw new Error("Deployment not found.");
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
                status: "STOPPED"
            }
        });

    return updated;
}
