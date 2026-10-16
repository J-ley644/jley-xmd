
import prisma from "../../config/prisma.js";
import { createSession } from "./pairing.js";

/*
 * Restore eligible WhatsApp sessions from persistent storage.
 *
 * Only deployments that are RUNNING and have not expired
 * should be restored. Stored credentials alone do not mean
 * a deployment is still active.
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
                    botName: true,
                    status: true,
                    expiresAt: true
                }
            });

            if (!deployment) {
                console.log(
                    `Skipping restore: deployment ${deploymentId} no longer exists.`
                );
                continue;
            }

            if (deployment.status !== "RUNNING") {
                console.log(
                    `Skipping restore for ${deployment.botName || deploymentId}: status is ${deployment.status}.`
                );
                continue;
            }

            if (
                deployment.expiresAt &&
                deployment.expiresAt <= new Date()
            ) {
                console.log(
                    `Skipping restore for ${deployment.botName || deploymentId}: deployment has expired.`
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
