import makeWASocket, {
    DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";

import QRCode from "qrcode";

import prisma from "../../config/prisma.js";

import {
    CONNECTION,
    RECONNECT_DELAY,
    MAX_RECONNECT_ATTEMPTS,
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
     * The socket itself can be replaced during
     * automatic reconnection while this object
     * remains registered in the manager.
     */

    const session = {

        deploymentId: key,

        sock: null,

        qr: null,

        code: null,

        ready: false,

        reconnects: 0,

        status: CONNECTION.CONNECTING,

        stopSync,

        stopping: false

    };


    setSession(key, session);


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

                    session.status =
                        CONNECTION.CONNECTED;


                    try {

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

                    } catch (error) {

                        console.error(
                            "DB connection update:",
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
                 * deployment that the user intentionally
                 * stopped.
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

                    } catch {}

                    return;

                }


                /*
                 * Automatic reconnect.
                 */

                if (
                    session.reconnects >=
                    MAX_RECONNECT_ATTEMPTS
                ) {

                    console.error(
                        `Deployment ${key} reached ${MAX_RECONNECT_ATTEMPTS} reconnect attempts.`
                    );


                    try {

                        await prisma.deployment.update({

                            where: {
                                id: key
                            },

                            data: {

                                status: "PENDING",

                                connectionStatus:
                                    "OFFLINE",

                                sessionReady: false

                            }

                        });

                    } catch {}

                    return;

                }


                session.reconnects++;


                console.log(
                    `Reconnect attempt ${session.reconnects}/${MAX_RECONNECT_ATTEMPTS} for ${key}`
                );


                clearReconnectTimer(key);


                const timer =
                    setTimeout(
                        async () => {

                            try {

                                /*
                                 * Make sure this deployment
                                 * has not been manually stopped
                                 * while waiting.
                                 */

                                if (
                                    session.stopping
                                ) {

                                    return;

                                }


                                /*
                                 * Recreate the socket using
                                 * the SAME persisted auth state.
                                 */

                                await connectSocket();


                            } catch (error) {

                                console.error(
                                    `Reconnect failed for ${key}:`,
                                    error.message
                                );


                                /*
                                 * Schedule another attempt
                                 * if the deployment is still active.
                                 */

                                if (
                                    !session.stopping &&
                                    session.reconnects <
                                        MAX_RECONNECT_ATTEMPTS
                                ) {

                                    clearReconnectTimer(
                                        key
                                    );


                                    const retryTimer =
                                        setTimeout(
                                            async () => {

                                                try {

                                                    await connectSocket();

                                                } catch (
                                                    retryError
                                                ) {

                                                    console.error(
                                                        `Retry failed for ${key}:`,
                                                        retryError.message
                                                    );

                                                }

                                            },
                                            RECONNECT_DELAY
                                        );


                                    setReconnectTimer(
                                        key,
                                        retryTimer
                                    );

                                }

                            }

                        },
                        RECONNECT_DELAY
                    );


                setReconnectTimer(
                    key,
                    timer
                );

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