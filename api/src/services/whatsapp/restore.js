import prisma from "../../config/prisma.js";
import { createSession } from "./pairing.js";

/*
 * Restore WhatsApp sessions from the persistent
 * WhatsAppSession store.
 *
 * The WhatsAppSession table is the source of truth for
 * authentication data. We do not rely only on
 * Deployment.status/sessionReady because those values
 * can be stale after moving the API to another server.
 */
export async function restoreSessions() {
    const storedSessions = await prisma.whatsAppSession.findMany({
        select: {
            deploymentId: true
        },
        distinct: ["deploymentId"]
    });

    console.log(
        `Found ${storedSessions.length} persisted WhatsApp deployment session(s).`
    );

    for (const stored of storedSessions) {
        const deploymentId = String(stored.deploymentId);

        try {
            await createSession(deploymentId);

            const deployment = await prisma.deployment.findUnique({
                where: {
                    id: deploymentId
                },
                select: {
                    botName: true
                }
            });

            console.log(
                "Restored:",
                deployment?.botName || deploymentId
            );
        } catch (err) {
            console.error(
                "Restore failed:",
                deploymentId,
                err.message
            );
        }
    }
}