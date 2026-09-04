import "dotenv/config";

import app from "./app.js";
import prisma from "./config/prisma.js";

import {
    restoreSessions
} from "./services/whatsapp/index.js";

import {
    expireDeployments
} from "./services/deploymentService.js";

import loadPlugins from "../../bot/core/pluginLoader.js";


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
                `Expired deployments stopped: ${expiredCount}`
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
| Restore WhatsApp sessions
|--------------------------------------------------------------------------
*/

async function restoreWhatsAppSessions() {

    try {

        console.log(
            "WhatsApp session restoration started..."
        );

        await restoreSessions();

        console.log(
            "WhatsApp session restoration completed."
        );

    } catch (error) {

        console.error(
            "WhatsApp session restoration failed:",
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

        /*
         * Connect database first.
         */

        await prisma.$connect();


        /*
         * Load bot plugins.
         */

        await loadPlugins();

        console.log(
            "JLEY-XMD advanced plugin engine loaded."
        );


        /*
         * Start HTTP server immediately.
         *
         * IMPORTANT:
         * WhatsApp session restoration no longer
         * blocks the API from accepting requests.
         */

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


                /*
                 * Restore WhatsApp sessions AFTER
                 * the API is already available.
                 */

                restoreWhatsAppSessions();


                /*
                 * Run deployment expiry check
                 * without blocking the API.
                 */

                runExpiryCheck();

            }
        );


        /*
         * Continue checking deployments every
         * five minutes.
         */

        setInterval(
            runExpiryCheck,
            5 * 60 * 1000
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