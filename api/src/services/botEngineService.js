
import prisma from "../config/prisma.js";
import * as deploymentManager from "./deploymentManager.js";

import startWhatsApp, {
    generatePairingCode,
    getSocket,
    getActiveSockets
} from "../../../bot/lib/whatsapp.js";

export async function createPairingCode(
    deploymentId,
    phoneNumber
) {

    let socket = getSocket(deploymentId);

    if (!socket) {

        const deployment =
            await prisma.deployment.findUnique({
                where: {
                    id: deploymentId
                }
            });

        if (!deployment) {
            throw new Error("Deployment not found");
        }

        console.log("Starting bot engine...");

        console.log("Bot engine started");
console.log("Running sockets after start:", getActiveSockets());

        await startBotEngine(deployment);

        // Wait a moment for the socket to register
        await new Promise(resolve => setTimeout(resolve, 2000));

        socket = getSocket(deploymentId);

        if (!socket) {
            throw new Error("Failed to start deployment socket");
        }

    }

    return await generatePairingCode(
        deploymentId,
        phoneNumber
    );

}

export async function startBotEngine(deployment) {

    const socket =
        await startWhatsApp(
            deployment.id
        );

    const botInstance = {

        deploymentId:
            deployment.id,

        ownerId:
            deployment.ownerId,

        botName:
            deployment.botName,

        socket,

        status:
            "RUNNING",

        startedAt:
            new Date()

    };

    deploymentManager.addBot(
        deployment.id,
        botInstance
    );

    await prisma.deployment.update({

        where: {
            id: deployment.id
        },

        data: {
            status: "RUNNING"
        }

    });

    return botInstance;

}

export async function stopBotEngine(id) {

    const bot =
        deploymentManager.getBot(id);

    if (bot?.socket) {

        try {

            await bot.socket.logout();

        } catch (error) {

            console.log(
                "Socket logout failed",
                error.message
            );

        }

    }

    deploymentManager.removeBot(id);

    await prisma.deployment.update({

        where: {
            id
        },

        data: {
            status: "STOPPED"
        }

    });

}