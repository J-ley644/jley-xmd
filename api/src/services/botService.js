import prisma from "../config/prisma.js";

import {
    getDeploymentStatus,
    stopDeploymentSession
} from "./whatsapp/index.js";


export async function listBots(userId) {

    const deployments =
        await prisma.deployment.findMany({
            where: {
                ownerId: userId
            },
            orderBy: {
                createdAt: "desc"
            }
        });

    const bots = [];

    for (const deployment of deployments) {

        const session =
            await getDeploymentStatus(
                deployment.id
            );

        bots.push({
            id: deployment.id,
            name: deployment.botName,
            status: session.status,
            qr: session.qr,
            deploymentId: deployment.id,
            createdAt: deployment.createdAt,
            updatedAt: deployment.updatedAt
        });
    }

    return bots;
}


export async function getBot(
    userId,
    botId
) {

    const deployment =
        await prisma.deployment.findFirst({
            where: {
                id: botId,
                ownerId: userId
            }
        });

    if (!deployment) {
        throw new Error("Bot not found.");
    }

    const session =
        await getDeploymentStatus(
            deployment.id
        );

    return {
        id: deployment.id,
        name: deployment.botName,
        status: session.status,
        qr: session.qr,
        deploymentId: deployment.id,
        createdAt: deployment.createdAt,
        updatedAt: deployment.updatedAt
    };
}


export async function stopBot(
    userId,
    botId
) {

    const deployment =
        await prisma.deployment.findFirst({
            where: {
                id: botId,
                ownerId: userId
            }
        });

    if (!deployment) {
        throw new Error("Bot not found.");
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

    return {
        id: updated.id,
        name: updated.botName,
        status: updated.status,
        deploymentId: updated.id
    };
}
