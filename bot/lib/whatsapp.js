
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import qrcode from "qrcode-terminal";
import path from "path";
import { fileURLToPath } from "url";

import logger from "./logger.js";
import config from "../config/config.js";

import { handleCommand } from "../core/commandHandler.js";

import groupSettings from "../system/groupSettings.js";
import { containsLink } from "./antilink.js";
import loadPlugins from "../core/pluginLoader.js";
import pluginStore from "../system/pluginStore.js";

import prisma from "../../api/src/config/prisma.js";


/*
================================================
        JLEY-XMD WHATSAPP ENGINE
================================================

Features:

✓ Multi deployment support
✓ QR pairing
✓ Session auth
✓ Dashboard integration
✓ Safe database updates
✓ Automatic reconnect
✓ LID / PN compatibility
✓ Group automation
✓ Anti-link system
✓ Plugin command engine
✓ 32-day deployment lifespan

================================================
*/


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


/*
================================================
        SOCKET STORAGE
================================================
*/

const sockets = new Map();
const pairingRequests = new Map();


/*
================================================
        CONSTANTS
================================================
*/

const DEPLOYMENT_LIFESPAN_DAYS = 32;

const DEPLOYMENT_LIFESPAN_MS =
    DEPLOYMENT_LIFESPAN_DAYS *
    24 *
    60 *
    60 *
    1000;


/*
================================================
        DATABASE HELPERS
================================================
*/

async function safeDeploymentUpdate(
    deploymentId,
    data
) {

    try {

        await prisma.deployment.update({

            where: {
                id: deploymentId
            },

            data

        });

        return true;

    } catch (error) {

        logger.error(
            {
                deploymentId,
                error: error.message
            },
            "Deployment database update failed"
        );

        return false;

    }

}


/*
================================================
        ID NORMALIZATION
================================================

Used for WhatsApp PN/LID comparisons.

================================================
*/

function normalize(id = "") {

    return id
        .replace(/:\d+@/, "@")
        .replace(/@lid$/i, "@s.whatsapp.net")
        .toLowerCase();

}


/*
================================================
        DEPLOYMENT EXPIRATION
================================================
*/

async function expireDeployment(
    deploymentId,
    socket
) {

    logger.warn(
        {
            deploymentId
        },
        "⏰ Deployment has reached its 32-day lifespan"
    );


    /*
    ------------------------------------------------
    Mark deployment expired before logout
    ------------------------------------------------
    */

    await safeDeploymentUpdate(
        deploymentId,
        {

            status: "STOPPED",

            connectionStatus: "EXPIRED",

            sessionReady: false,

            qrCode: null,

            pairingCode: null

        }
    );


    /*
    ------------------------------------------------
    Logout WhatsApp session.

    This is intentional ONLY when the deployment
    has reached its expiration date.
    ------------------------------------------------
    */

    if (socket) {

        try {

            await socket.logout();

            logger.info(
                {
                    deploymentId
                },
                "WhatsApp session logged out after deployment expiration"
            );

        } catch (error) {

            logger.warn(
                {
                    deploymentId,
                    error: error.message
                },
                "WhatsApp logout during expiration failed"
            );

        }

    }


    /*
    ------------------------------------------------
    Remove socket from memory.
    ------------------------------------------------
    */

    sockets.delete(deploymentId);
    pairingRequests.delete(deploymentId);

}


/*
================================================
        CHECK DEPLOYMENT EXPIRATION
================================================
*/

async function checkDeploymentExpiration(
    deploymentId,
    socket
) {

    try {

        const deployment =
            await prisma.deployment.findUnique({

                where: {
                    id: deploymentId
                }

            });


        if (!deployment) {

            logger.warn(
                {
                    deploymentId
                },
                "Cannot check expiration: deployment not found"
            );

            return false;

        }


        /*
        ------------------------------------------------
        No activation yet.

        This means the bot may still be waiting for
        pairing and the 32-day timer has not started.
        ------------------------------------------------
        */

        if (!deployment.activatedAt) {

            return false;

        }


        /*
        ------------------------------------------------
        If expiration somehow does not exist, create it
        from the original activation date.

        This prevents reconnects from extending the
        deployment lifespan.
        ------------------------------------------------
        */

        let expiresAt =
            deployment.expiresAt;


        if (!expiresAt) {

            expiresAt =
                new Date(
                    deployment.activatedAt.getTime() +
                    DEPLOYMENT_LIFESPAN_MS
                );


            await safeDeploymentUpdate(
                deploymentId,
                {
                    expiresAt
                }
            );

        }


        const now = new Date();


        if (now >= expiresAt) {

            await expireDeployment(
                deploymentId,
                socket
            );

            return true;

        }


        return false;

    } catch (error) {

        logger.error(
            {
                deploymentId,
                error: error.message
            },
            "Deployment expiration check failed"
        );

        return false;

    }

}


/*
================================================
        START WHATSAPP
================================================
*/

async function startWhatsApp(
    deploymentId = "main"
) {

    console.log(
        "🔥 WHATSAPP START DEPLOYMENT ID:",
        deploymentId
    );


    /*
    ------------------------------------------------
    Prevent duplicate sockets.
    ------------------------------------------------
    */

    const existingSocket =
        sockets.get(deploymentId);


    if (existingSocket) {

        logger.warn(
            {
                deploymentId
            },
            "Deployment socket already exists"
        );

        return existingSocket;

    }


    /*
    ------------------------------------------------
    Load plugins once.
    ------------------------------------------------
    */

    if (pluginStore.size() === 0) {

        await loadPlugins();

    }


    /*
    ------------------------------------------------
    Session path
    ------------------------------------------------
    */

    const sessionPath =
        path.join(
            __dirname,
            "../sessions",
            deploymentId
        );


    /*
    ------------------------------------------------
    Multi-file authentication state
    ------------------------------------------------
    */

    const {
        state,
        saveCreds
    } =
        await useMultiFileAuthState(
            sessionPath
        );


    /*
    ------------------------------------------------
    Baileys version
    ------------------------------------------------
    */

    const {
        version
    } =
        await fetchLatestBaileysVersion();


    /*
    ------------------------------------------------
    Create WhatsApp socket
    ------------------------------------------------
    */

    const socket =
        makeWASocket({

            version,

            auth: state,

            browser: [
                "JLEY-XMD",
                "Dashboard",
                config.version
            ]

        });


    /*
    ------------------------------------------------
    Register socket
    ------------------------------------------------
    */

    sockets.set(
        deploymentId,
        socket
    );


    /*
    ------------------------------------------------
    Credentials
    ------------------------------------------------
    */

    socket.ev.on(
        "creds.update",
        saveCreds
    );


    /*
================================================
        CONNECTION EVENTS
================================================
*/

    socket.ev.on(
        "connection.update",
        async (update) => {

            try {

                const {
                    connection,
                    qr,
                    lastDisconnect
                } = update;


                /*
                ================================================
                        QR CODE
                ================================================
                */

                if (qr) {

                    logger.info(
                        {
                            deploymentId
                        },
                        "QR Generated"
                    );


                    await safeDeploymentUpdate(
                        deploymentId,
                        {

                            qrCode: qr,

                            sessionReady: false,

                            status: "PENDING",

                            connectionStatus: "PAIRING"

                        }
                    );


                    qrcode.generate(
                        qr,
                        {
                            small: true
                        }
                    );

                }


                /*
                ================================================
                        WHATSAPP CONNECTED
                ================================================
                */

                if (connection === "open") {

                    logger.info(
                        {
                            deploymentId
                        },
                        "✅ WhatsApp Connected"
                    );


                    const deployment =
                        await prisma.deployment.findUnique({

                            where: {
                                id: deploymentId
                            }

                        });


                    if (!deployment) {

                        logger.warn(
                            {
                                deploymentId
                            },
                            "Deployment not found after WhatsApp connection"
                        );

                        return;

                    }


                    /*
                    ------------------------------------------------
                    Check whether this deployment has already expired.
                    ------------------------------------------------
                    */

                    const alreadyExpired =
                        await checkDeploymentExpiration(
                            deploymentId,
                            socket
                        );


                    if (alreadyExpired) {

                        return;

                    }


                    const now =
                        new Date();


                    let activatedAt =
                        deployment.activatedAt;


                    let expiresAt =
                        deployment.expiresAt;


                    /*
                    ------------------------------------------------
                    FIRST successful connection.

                    This is where the 32-day lifespan begins.

                    Reconnects will NOT enter this block because
                    activatedAt already exists.
                    ------------------------------------------------
                    */

                    if (!activatedAt) {

                        activatedAt =
                            now;


                        expiresAt =
                            new Date(
                                now.getTime() +
                                DEPLOYMENT_LIFESPAN_MS
                            );


                        logger.info(
                            {
                                deploymentId,
                                activatedAt,
                                expiresAt,
                                lifespanDays:
                                    DEPLOYMENT_LIFESPAN_DAYS
                            },
                            "🚀 Deployment activated for 32 days"
                        );

                    }


                    /*
                    ------------------------------------------------
                    Safety fallback.

                    If activation exists but expiration is missing,
                    calculate expiration from the ORIGINAL
                    activation date.
                    ------------------------------------------------
                    */

                    if (!expiresAt) {

                        expiresAt =
                            new Date(
                                activatedAt.getTime() +
                                DEPLOYMENT_LIFESPAN_MS
                            );

                    }


                    /*
                    ------------------------------------------------
                    Final database state.
                    ------------------------------------------------
                    */

                    await safeDeploymentUpdate(
                        deploymentId,
                        {

                            qrCode: null,

                            pairingCode: null,

                            sessionReady: true,

                            status: "RUNNING",

                            connectionStatus: "CONNECTED",

                            lastConnected: now,

                            activatedAt,

                            expiresAt

                        }
                    );


                    logger.info(
                        {
                            deploymentId,
                            activatedAt,
                            expiresAt
                        },
                        "✅ Deployment connection state updated"
                    );

                }


                /*
                ================================================
                        WHATSAPP DISCONNECTED
                ================================================
                */

                if (connection === "close") {

                    console.log(
                        "========================================"
                    );

                    console.log(
                        "🔴 WHATSAPP CONNECTION CLOSED"
                    );

                    console.log(
                        "Deployment:",
                        deploymentId
                    );

                    console.log(
                        "Connection:",
                        connection
                    );

                    console.log(
                        "Last disconnect:",
                        lastDisconnect
                    );

                    console.log(
                        "Disconnect error:",
                        lastDisconnect?.error
                    );

                    console.log(
                        "Disconnect status code:",
                        lastDisconnect
                            ?.error
                            ?.output
                            ?.statusCode
                    );

                    console.log(
                        "========================================"
                    );


                    const code =
                        lastDisconnect
                            ?.error
                            ?.output
                            ?.statusCode;


                    logger.warn(
                        {
                            deploymentId,
                            code
                        },
                        "WhatsApp disconnected"
                    );


                    /*
                    ------------------------------------------------
                    Check whether deployment lifespan has expired
                    before attempting reconnect.
                    ------------------------------------------------
                    */

                    const expired =
                        await checkDeploymentExpiration(
                            deploymentId,
                            socket
                        );


                    if (expired) {

                        return;

                    }


                    /*
                    ------------------------------------------------
                    Baileys reconnect behavior.

                    A normal network/session disconnect does NOT
                    logout the WhatsApp account.

                    The existing saved session is reused.
                    ------------------------------------------------
                    */

                    const reconnect =
                        code !==
                        DisconnectReason.loggedOut;


                    if (reconnect) {

                        await safeDeploymentUpdate(
                            deploymentId,
                            {

                                connectionStatus:
                                    "RECONNECTING",

                                sessionReady:
                                    false

                            }
                        );


                        setTimeout(
                            async () => {

                                try {

                                    /*
                                    Check expiration again immediately
                                    before creating another socket.
                                    */

                                    const currentSocket =
                                        sockets.get(
                                            deploymentId
                                        );


                                    const isExpired =
                                        await checkDeploymentExpiration(
                                            deploymentId,
                                            currentSocket
                                        );


                                    if (isExpired) {

                                        return;

                                    }


                                    /*
                                    Remove the old socket reference
                                    before starting the replacement.
                                    */

                                    if (
                                        sockets.get(
                                            deploymentId
                                        ) === socket
                                    ) {

                                        sockets.delete(
                                            deploymentId
                                        );

                                    }


                                    await startWhatsApp(
                                        deploymentId
                                    );

                                } catch (error) {

                                    logger.error(
                                        {
                                            deploymentId,
                                            error: error.message
                                        },
                                        "WhatsApp reconnect failed"
                                    );

                                }

                            },
                            3000
                        );

                    } else {

                        /*
                        ------------------------------------------------
                        WhatsApp explicitly logged the session out.

                        This is different from temporary inactivity.
                        ------------------------------------------------
                        */

                        logger.warn(
                            {
                                deploymentId
                            },
                            "WhatsApp session was logged out"
                        );


                        sockets.delete(
                            deploymentId
                        );


                        pairingRequests.delete(
                            deploymentId
                        );


                        await safeDeploymentUpdate(
                            deploymentId,
                            {

                                status: "STOPPED",

                                connectionStatus: "LOGGED_OUT",

                                sessionReady: false,

                                qrCode: null

                            }
                        );

                    }

                }

            } catch (error) {

                logger.error(
                    {
                        deploymentId,
                        error: error.message
                    },
                    "Connection update handler failed"
                );

            }

        }
    );


    /*
================================================
        MESSAGE EVENT ENGINE
================================================
*/

    socket.ev.on(
        "messages.upsert",
        async ({ messages }) => {

            try {

                console.log(
                    "📩 MESSAGE RECEIVED",
                    messages[0]?.key
                );


                for (const message of messages) {

                    if (!message.message) {
                        continue;
                    }


                    message.chat =
                        message.key.remoteJid;


                    await processMessage(
                        socket,
                        message
                    );

                }

            } catch (error) {

                logger.error(
                    error,
                    "Message event failed"
                );

            }

        }
    );


    /*
================================================
        GROUP AUTOMATION ENGINE
================================================
*/

    socket.ev.on(
        "group-participants.update",
        async (update) => {

            try {

                const {
                    id,
                    participants,
                    action
                } = update;


                const settings =
                    groupSettings.get(id);


                if (!settings) {
                    return;
                }


                const metadata =
                    await socket.groupMetadata(id);


                const groupName =
                    metadata.subject;


                for (const participant of participants) {

                    const jid =
                        typeof participant === "string"
                            ? participant
                            : participant.id;


                    const number =
                        jid.split("@")[0];


                    /*
                    ------------------------------------------------
                    Welcome
                    ------------------------------------------------
                    */

                    if (
                        action === "add" &&
                        settings.welcome
                    ) {

                        await socket.sendMessage(
                            id,
                            {

                                text:
`🤖 ${config.botName}

👋 Welcome @${number}

📌 Group:
${groupName}

Enjoy your stay ❤️`,

                                mentions: [
                                    jid
                                ]

                            }
                        );

                    }


                    /*
                    ------------------------------------------------
                    Goodbye
                    ------------------------------------------------
                    */

                    if (
                        action === "remove" &&
                        settings.goodbye
                    ) {

                        await socket.sendMessage(
                            id,
                            {

                                text:
`🤖 ${config.botName}

👋 Goodbye @${number}

📌 Left:
${groupName}

We'll miss you ❤️`,

                                mentions: [
                                    jid
                                ]

                            }
                        );

                    }

                }

            } catch (error) {

                logger.error(
                    error,
                    "Group automation failed"
                );

            }

        }
    );


    return socket;

}


/*
================================================
        MESSAGE PROCESSOR
================================================
*/

async function processMessage(
    socket,
    message
) {

    try {

        const chat =
            message.key.remoteJid;


        const sender =
            message.key.participant ||
            message.participant ||
            message.key.remoteJid;


        const botJid =
            socket.user?.id;


        const botLid =
            socket.user?.lid;


        /*
        ------------------------------------------------
        Ignore messages from the bot itself.
        ------------------------------------------------
        */

        if (
            botJid &&
            normalize(sender) ===
            normalize(botJid)
        ) {

            return;

        }


        logger.info(
            {
                chat,
                sender,
                botJid,
                botLid
            },
            "Message identity check"
        );


        const text =

            message.message?.conversation

            ||

            message.message
                ?.extendedTextMessage
                ?.text

            ||

            message.message
                ?.imageMessage
                ?.caption

            ||

            "";


        console.log(
            "MESSAGE TEXT:",
            text
        );


        /*
        ================================================
                ANTI LINK SYSTEM
        ================================================
        */

        if (
            chat?.endsWith("@g.us")
        ) {

            const settings =
                groupSettings.get(chat);


            if (settings?.antilink) {

                const metadata =
                    await socket.groupMetadata(chat);


                const member =
                    metadata.participants.find(
                        (participant) =>
                            normalize(participant.id) ===
                                normalize(sender) ||

                            (
                                participant.lid &&
                                normalize(participant.lid) ===
                                    normalize(sender)
                            )
                    );


                const isAdmin =
                    member?.admin === "admin" ||
                    member?.admin === "superadmin";


                const isBot =
                    (
                        botJid &&
                        normalize(sender) ===
                            normalize(botJid)
                    ) ||

                    (
                        botLid &&
                        normalize(sender) ===
                            normalize(botLid)
                    ) ||

                    message.key.fromMe;


                if (
                    containsLink(text) &&
                    !isAdmin &&
                    !isBot
                ) {

                    await socket.sendMessage(
                        chat,
                        {
                            delete: message.key
                        }
                    );


                    await socket.sendMessage(
                        chat,
                        {

                            text:
`🚫 Links are not allowed.

@${sender.split("@")[0]} remove the link.`,

                            mentions: [
                                sender
                            ]

                        }
                    );


                    return;

                }

            }

        }


        /*
        ================================================
                COMMAND ENGINE
        ================================================
        */

        console.log({

            deployment:
                socket.user?.id,

            fromMe:
                message.key.fromMe,

            remoteJid:
                message.key.remoteJid,

            participant:
                message.key.participant,

            remoteJidAlt:
                message.key.remoteJidAlt

        });


        await handleCommand(
            socket,
            message
        );


    } catch (error) {

        logger.error(
            error,
            "Message processing error"
        );

    }

}


/*
================================================
        SOCKET MANAGEMENT
================================================
*/

function getSocket(
    deploymentId
) {

    return sockets.get(
        deploymentId
    );

}


async function generatePairingCode(
    deploymentId,
    phoneNumber
) {

    console.log(
        "Requested deployment:",
        deploymentId
    );


    console.log(
        "Running sockets:",
        getActiveSockets()
    );


    const socket =
        getSocket(
            deploymentId
        );


    if (!socket) {

        throw new Error(
            "Deployment socket not running"
        );

    }


    if (!phoneNumber) {

        throw new Error(
            "Phone number required"
        );

    }


    /*
    ------------------------------------------------
    Check deployment before pairing.
    ------------------------------------------------
    */

    const deployment =
        await prisma.deployment.findUnique({

            where: {
                id: deploymentId
            }

        });


    if (!deployment) {

        throw new Error(
            "Deployment not found"
        );

    }


    /*
    ------------------------------------------------
    If the deployment has already expired, don't
    issue another pairing code.
    ------------------------------------------------
    */

    if (
        deployment.expiresAt &&
        new Date() >= deployment.expiresAt
    ) {

        await expireDeployment(
            deploymentId,
            socket
        );


        throw new Error(
            "This deployment has expired."
        );

    }


    const cleanNumber =
        phoneNumber.replace(
            /\D/g,
            ""
        );


    const code =
        await socket.requestPairingCode(
            cleanNumber
        );


    await safeDeploymentUpdate(
        deploymentId,
        {

            pairingCode: code,

            phoneNumber: cleanNumber,

            status: "PENDING",

            connectionStatus: "PAIRING"

        }
    );


    pairingRequests.set(
        deploymentId,
        code
    );


    return code;

}


/*
================================================
        REMOVE SOCKET
================================================
*/

function removeSocket(
    deploymentId
) {

    sockets.delete(
        deploymentId
    );

    pairingRequests.delete(
        deploymentId
    );

}


/*
================================================
        ACTIVE SOCKETS
================================================
*/

function getActiveSockets() {

    return [
        ...sockets.keys()
    ];

}


/*
================================================
        DEPLOYMENT STARTER
================================================

Used by:

- Dashboard deploy system
- Main bot
- Future worker manager

================================================
*/

async function launchWhatsApp(
    deploymentId = "main"
) {

    const existing =
        getSocket(
            deploymentId
        );


    if (existing) {

        logger.warn(
            {
                deploymentId
            },
            "Deployment already running"
        );


        return existing;

    }


    const socket =
        await startWhatsApp(
            deploymentId
        );


    return socket;

}


/*
================================================
        HEALTH CHECK
================================================
*/

function isConnected(
    deploymentId
) {

    const socket =
        getSocket(
            deploymentId
        );


    return Boolean(
        socket?.user
    );

}


/*
================================================
        EXPORTS
================================================
*/

export {

    startWhatsApp,

    launchWhatsApp,

    getSocket,

    removeSocket,

    getActiveSockets,

    isConnected,

    generatePairingCode

};


export default startWhatsApp;
