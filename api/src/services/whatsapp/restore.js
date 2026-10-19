
import prisma from "../../config/prisma.js";
import { createSession } from "./pairing.js";

const RESTORE_CONCURRENCY = 3;

/**
 * Restore persisted WhatsApp sessions after an API restart.
 * Restore up to three deployments concurrently without
 * changing their stored authentication credentials.
 */
export async function restoreSessions() {
    console.log("[RESTORE] Loading persisted deployment sessions...");

    const storedSessions = await prisma.whatsAppSession.findMany({
        select: {
            deploymentId: true
        },
        distinct: ["deploymentId"]
    });

    console.log(
        `[RESTORE] Found ${storedSessions.length} persisted deployment session(s).`
    );

    if (storedSessions.length === 0) {
        console.log("[RESTORE] No sessions require restoration.");
        return;
    }

    let nextIndex = 0;
    let initiated = 0;
    let skipped = 0;
    let failed = 0;

    const workerCount = Math.min(
        RESTORE_CONCURRENCY,
        storedSessions.length
    );

    console.log(
        `[RESTORE] Starting ${workerCount} restoration worker(s).`
    );

    async function restoreNext() {
        while (true) {
            const index = nextIndex++;

            if (index >= storedSessions.length) {
                return;
            }

            const deploymentId = String(
                storedSessions[index].deploymentId
            );

            try {
                console.log(
                    `[RESTORE] ${deploymentId}: checking deployment...`
                );

                const deployment = await prisma.deployment.findUnique({
                    where: {
                        id: deploymentId
                    },
                    select: {
                        botName: true
                    }
                });

                if (!deployment) {
                    skipped++;

                    console.log(
                        `[RESTORE] ${deploymentId}: skipped; deployment no longer exists.`
                    );

                    continue;
                }

                console.log(
                    `[RESTORE] ${deploymentId}: initializing session...`
                );

                await createSession(deploymentId);

                initiated++;

                console.log(
                    `[RESTORE] ${deployment.botName || deploymentId}: session initialization completed.`
                );
            } catch (err) {
                failed++;

                console.error(
                    `[RESTORE] ${deploymentId}: restoration failed:`,
                    err?.stack || err?.message || err
                );
            }
        }
    }

    await Promise.all(
        Array.from(
            { length: workerCount },
            () => restoreNext()
        )
    );

    console.log(
        `[RESTORE] Finished. Initiated: ${initiated}; skipped: ${skipped}; failed: ${failed}.`
    );
}
