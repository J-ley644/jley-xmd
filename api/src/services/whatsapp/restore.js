
import prisma from "../../config/prisma.js";
import { createSession } from "./pairing.js";

/**
 * Restore persisted WhatsApp sessions after an API restart.
 * A stale STOPPED status must not prevent restoring saved
 * WhatsApp authentication data.
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
            const deployment = await prisma.deployment.findUnique({
                where: {
                    id: deploymentId
                },
                select: {
                    botName: true
                }
            });

            if (!deployment) {
                console.log(
                    `Skipping restore: deployment ${deploymentId} no longer exists.`
                );
                continue;
            }

            await createSession(deploymentId);

            console.log(
                "Restore initiated:",
                deployment.botName || deploymentId
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
