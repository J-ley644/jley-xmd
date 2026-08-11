
import "dotenv/config";

import app from "./app.js";
import prisma from "./config/prisma.js";

import {
    restoreSessions
} from "./services/whatsapp/index.js";

import {
    expireDeployments
} from "./services/deploymentService.js";


const PORT =
    process.env.PORT || 5000;


/*
|--------------------------------------------------------------------------
| Deployment expiry worker
|--------------------------------------------------------------------------
*/

async function runExpiryCheck() {

    try {

        const expiredCount =
            await expireDeployments();

        if (expiredCount > 0) {

            console.log(
                `⏰ Expired deployments stopped: ${expiredCount}`
            );

        }

    } catch (error) {

        console.error(
            "Deployment expiry check failed:",
            error.message
        );

    }

}


/*
|--------------------------------------------------------------------------
| Start API
|--------------------------------------------------------------------------
*/

async function start() {

    try {

        await prisma.$connect();


        console.log("");
        console.log("==================================");
        console.log("🚀 JLEY-XMD API");
        console.log("==================================");
        console.log(`Port    : ${PORT}`);
        console.log("Database: Connected");
        console.log("Status  : Starting...");
        console.log("==================================");
        console.log("");


        /*
         * Restore WhatsApp sessions from the database.
         */

        await restoreSessions();


        /*
         * Check for already-expired deployments
         * immediately when Render starts the API.
         */

        await runExpiryCheck();


        /*
         * Check every 5 minutes while the API is running.
         */

        setInterval(
            runExpiryCheck,
            5 * 60 * 1000
        );


        app.listen(
            PORT,
            () => {

                console.log("");
                console.log("==================================");
                console.log("JLEY-XMD API");
                console.log("==================================");
                console.log(`Port    : ${PORT}`);
                console.log("Database: Connected");
                console.log("Status  : Running");
                console.log("Deployment expiry: Active");
                console.log("==================================");
                console.log("");

            }
        );


    } catch (error) {

        console.error(
            "Failed to start API:",
            error
        );

        process.exit(1);

    }

}


start();

