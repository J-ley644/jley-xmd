import makeWASocket, {
    DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";

import QRCode from "qrcode";

import prisma from "../../config/prisma.js";

import { generateSessionId } from "../../utils/sessionId.js";

import {
    CONNECTION,
    RECONNECT_INITIAL_DELAY,
    RECONNECT_MAX_DELAY,
    RECONNECT_BACKOFF_MULTIPLIER,
    DEFAULT_BROWSER
} from "./constants.js";

import {
    getSession,
    setSession,
    removeSession,
    clearReconnectTimer,
    setReconnectTimer
} from "./manager.js";


export async function createSocket(
    deploymentId,
    authState,
    saveCreds,
    phoneNumber = null,
    stopSync = null
) {

    const key = String(deploymentId);


    /*
     * Do not create duplicate sockets.
     */

    const existing = getSession(key);

    if (existing?.sock) {

        return existing;

    }


    /*
     * Shared deployment session object.
     *
     * The socket can be replaced during automatic
     * reconnection while this session object remains
     * registered in the manager.
     */

    const session = {

        deploymentId: key,

        sock: null,

        qr: null,

        code: null,

        ready: false,

        reconnects: 0,

        reconnectDelay: RECONNECT_INITIAL_DELAY,

        status: CONNECTION.CONNECTING,

        stopSync,

        stopping: false

    };


    setSession(key, session);


    /*
     * Schedule another connection attempt.
     *
     * Temporary WhatsApp/network failures should never
     * permanently kill a deployment.
     */

    const scheduleReconnect = () => {

        if (session.stopping) {

            return;

        }


        clearReconnectTimer(key);


        const delay = Math.min(
            session.reconnectDelay,
            RECONNECT_MAX_DELAY
        );


        session.reconnects++;


        console.log(
            `Reconnect attempt ${session.reconnects} for ${key} in ${delay}ms`
        );


        const timer = setTimeout(
            async () => {

                if (session.stopping) {

                    return;

                }


                try {

                    await connectSocket();

                } catch (error) {

                    console.error(
                        `Reconnect failed for ${key}:`,
                        error.message
                    );


                    /*
                     * If socket creation itself fails,
                     * schedule another attempt.
                     */

                    if (!session.stopping) {

                        scheduleReconnect();

                    }

                }

            },
            delay
        );


        setReconnectTimer(
            key,
            timer
        );


        /*
         * Increase the delay for the next failure.
         *
         * Example:
         *
         * 3s
         * 4.5s
         * 6.75s
         * 10.1s
         * ...
         * maximum 60s
         */

        session.reconnectDelay = Math.min(
            Math.floor(
                session.reconnectDelay *
                RECONNECT_BACKOFF_MULTIPLIER
            ),
            RECONNECT_MAX_DELAY
        );

    };


    /*
     * Create the WhatsApp socket.
     *
     * This function is also used by the automatic
     * reconnect system.
     */

    const connectSocket = async () => {

        if (session.stopping) {

            return;

        }


        console.log(
            `Creating WhatsApp socket for deployment ${key}`
        );


        const sock = makeWASocket({

            auth: authState,

            browser: DEFAULT_BROWSER,

            logger: P({
                level: "silent"
            }),

            printQRInTerminal: false,

            markOnlineOnConnect: true,

            syncFullHistory: false,

            generateHighQualityLinkPreview: false

        });


        session.sock = sock;


        /*
         * Save credentials to Supabase-backed
         * session storage.
         */

        sock.ev.on(
            "creds.update",
            saveCreds
        );


        /*
         * Connection events.
         */

        sock.ev.on(
            "connection.update",
            async (update) => {

                const {
                    connection,
                    qr,
                    lastDisconnect
                } = update;


                const disconnectCode =
                    lastDisconnect
                        ?.error
                        ?.output
                        ?.statusCode;


                console.log(
                    "WHATSAPP:",
                    {
                        deploymentId: key,
                        connection,
                        qr: !!qr,
                        code: disconnectCode
                    }
                );


                /*
                 * Ignore events from an old socket that
                 * has already been replaced.
                 */

                if (
                    session.sock !== sock
                ) {

                    return;

                }


                /*
                 * QR CODE
                 */

                if (qr) {

                    try {

                        session.qr =
                            await QRCode.toDataURL(qr);

                        session.status =
                            CONNECTION.QR_READY;

                        session.ready = false;

                    } catch (error) {

                        console.error(
                            "QR generation failed:",
                            error.message
                        );

                    }

                }


                /*
                 * CONNECTED
                 */

                if (connection === "open") {

                    clearReconnectTimer(key);

                    session.ready = true;

                    session.qr = null;

                    session.code = null;

                    session.reconnects = 0;

                    session.reconnectDelay =
                        RECONNECT_INITIAL_DELAY;

                    session.status =
                        CONNECTION.CONNECTED;


                    try {

    const deployment =
        await prisma.deployment.findUnique({
            where: {
                id: key
            }
        });


    if (!deployment) {

        console.error(
            `Deployment ${key} not found while connecting.`
        );

        return;

    }


    /*
     * Generate the application-level JLEY session ID
     * only after WhatsApp has successfully connected.
     *
     * Existing deployments keep their original session ID
     * across reconnects.
     */

    let sessionId =
        deployment.sessionId;


    if (!sessionId) {

        sessionId =
            generateSessionId();


        /*
         * Atomically claim the session ID.
         *
         * This prevents duplicate IDs/messages if WhatsApp
         * emits the open event more than once.
         */

        const claimed =
            await prisma.deployment.updateMany({

                where: {

                    id: key,

                    sessionId: null

                },

                data: {

                    sessionId

                }

            });


        if (claimed.count === 0) {

            const existing =
                await prisma.deployment.findUnique({
                    where: {
                        id: key
                    },
                    select: {
                        sessionId: true
                    }
                });

            sessionId =
                existing?.sessionId || sessionId;

        }

    }


    /*
     * Mark deployment as fully connected.
     */

    await prisma.deployment.update({

        where: {
            id: key
        },

        data: {

            status: "RUNNING",

            connectionStatus:
                "CONNECTED",

            sessionReady: true,

            lastConnected:
                new Date()

        }

    });


    /*
     * Send the JLEY session ID to the linked
     * WhatsApp account's own DM.
     *
     * sock.user.id is available after the socket
     * successfully reaches the open state.
     */

    if (
        sessionId &&
        sock.user?.id &&
        !deployment.sessionId
    ) {

        try {

            await sock.sendMessage(
                sock.user.id,
                {
                    text:
                        `JLEY-XMD Session ID\n\n` +
                        `${sessionId}\n\n` +
                        `Keep this Session ID private. ` +
                        `Paste it into the preserved-session ` +
                        `configuration of your bot.`
                }
            );


            console.log(
                `JLEY session ID sent to WhatsApp for deployment ${key}`
            );

        } catch (error) {

            /*
             * The session ID is already safely stored in
             * the database. If WhatsApp temporarily fails
             * to deliver the DM, the deployment itself
             * remains connected.
             */

            console.error(
                "Failed to send JLEY session ID:",
                error.message
            );

        }

    }

} catch (error) {

    console.error(
        "DB connection/session update:",
        error.message
    );

}


                    console.log(
                        `CONNECTED: ${key}`
                    );


                    return;

                }


                /*
                 * Ignore intermediate states.
                 */

                if (connection !== "close") {

                    return;

                }


                /*
                 * Socket closed.
                 */

                session.ready = false;

                session.status =
                    CONNECTION.OFFLINE;


                console.log(
                    `Disconnected: ${key}`,
                    disconnectCode
                );


                /*
                 * Manual stop/logout.
                 *
                 * Never automatically reconnect a
                 * deployment intentionally stopped by
                 * the user.
                 */

                if (session.stopping) {

                    console.log(
                        `Deployment ${key} was intentionally stopped.`
                    );

                    return;

                }


                /*
                 * WhatsApp logged the account out.
                 *
                 * This requires a new QR/pairing process.
                 */

                if (
                    disconnectCode ===
                    DisconnectReason.loggedOut
                ) {

                    console.log(
                        `WhatsApp logged out deployment ${key}`
                    );


                    clearReconnectTimer(key);

                    removeSession(key);


                    try {

                        await prisma.deployment.update({

                            where: {
                                id: key
                            },

                            data: {

                                status: "STOPPED",

                                connectionStatus:
                                    "OFFLINE",

                                sessionReady: false

                            }

                        });

                    } catch (error) {

                        console.error(
                            "Logout DB update:",
                            error.message
                        );

                    }


                    return;

                }


                /*
                 * Temporary connection failure.
                 *
                 * Keep the deployment alive and continue
                 * reconnecting indefinitely.
                 */

                try {

                    await prisma.deployment.update({

                        where: {
                            id: key
                        },

                        data: {

                            status: "RUNNING",

                            connectionStatus:
                                "OFFLINE",

                            sessionReady: true

                        }

                    });

                } catch (error) {

                    console.error(
                        "Offline DB update:",
                        error.message
                    );

                }


                scheduleReconnect();

            }
        );


        /*
         * Incoming WhatsApp messages.
         */

        sock.ev.on(
            "messages.upsert",
            async ({ messages }) => {

                if (!messages?.length) {

                    return;

                }


                /*
                 * Ignore messages from an old socket
                 * after a reconnect replacement.
                 */

                if (
                    session.sock !== sock
                ) {

                    return;

                }


                for (
                    const message of messages
                ) {

                    try {

                        const {
                            handleMessage
                        } = await import(
                            "../messageService.js"
                        );


                        await handleMessage(
                            sock,
                            message
                        );

                    } catch (error) {

                        console.error(
                            "Message handler:",
                            error.message
                        );

                    }

                }

            }
        );


        return sock;

    };


    /*
     * Initial socket creation.
     */

    await connectSocket();


    /*
     * Pairing-code flow.
     */

    if (phoneNumber) {

        try {

            const normalizedPhone =
                String(phoneNumber)
                    .replace(/\D/g, "");


            if (!normalizedPhone) {

                throw new Error(
                    "Invalid phone number."
                );

            }


            const pairingCode =
                await session.sock.requestPairingCode(
                    normalizedPhone
                );


            session.code =
                pairingCode;

            session.qr = null;

            session.status =
                CONNECTION.CONNECTING;


            console.log(
                "PAIRING CODE READY:",
                pairingCode
            );

        } catch (error) {

            console.error(
                "Pairing code generation failed:",
                error.message
            );

            session.code = null;

        }

    }


    return session;

}


/*
 * Destroy / stop deployment.
 */

export async function destroySocket(
    deploymentId,
    logout = false
) {

    const key =
        String(deploymentId);


    const session =
        getSession(key);


    if (!session) {

        return;

    }


    /*
     * Mark the session as intentionally stopping
     * BEFORE closing the socket.
     *
     * This prevents the connection.update "close"
     * handler from starting a reconnect.
     */

    session.stopping = true;


    clearReconnectTimer(key);


    try {

        if (
            logout &&
            session.sock
        ) {

            await session.sock.logout();

        } else if (
            session.sock
        ) {

            session.sock.end?.();

        }

    } catch (error) {

        console.error(
            `Socket shutdown error for ${key}:`,
            error.message
        );

    }


    if (session.stopSync) {

        session.stopSync();

    }


    removeSession(key);

}


/*
 * Get current deployment socket/session.
 */

export function getSocket(
    deploymentId
) {

    return getSession(
        deploymentId
    );

}