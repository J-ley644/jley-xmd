import prisma from "../../config/prisma.js";
import { createSession } from "./pairing.js";

export async function restoreSessions() {

    const deployments = await prisma.deployment.findMany({

        where: {

            status: "RUNNING",

            sessionReady: true

        }

    });

    for (const deployment of deployments) {

        try {

            await createSession(deployment.id);

            console.log(

                "Restored:",

                deployment.botName

            );

        }

        catch (err) {

            console.error(

                "Restore failed:",

                deployment.id,

                err.message

            );

        }

    }

}