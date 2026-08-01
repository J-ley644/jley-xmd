import "dotenv/config";
import app from "./app.js";
import prisma from "./config/prisma.js";
import {
    restoreSessions
} from "./services/whatsapp/index.js";

const PORT = process.env.PORT || 5000;

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

        await restoreSessions();

        app.listen(PORT, () => {
            console.log("");
            console.log("==================================");
            console.log("JLEY-XMD API");
            console.log("==================================");
            console.log(`Port    : ${PORT}`);
            console.log("Database: Connected");
            console.log("Status  : Running");
            console.log("==================================");
            console.log("");
        });

    } catch (error) {
        console.error("Failed to start API:", error);
        process.exit(1);
    }
}

start();