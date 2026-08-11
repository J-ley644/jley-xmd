import makeWASocket, {
    DisconnectReason
} from "@whiskeysockets/baileys";

import P from "pino";

import QRCode from "qrcode";

import prisma from "../../config/prisma.js";

import {

    CONNECTION,

    RECONNECT_DELAY,

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



    const existing = getSession(key);

    if (existing?.sock) {

        return existing;

    }



    const session = {

        deploymentId: key,

        sock: null,

        qr: null,

        code: null,

        ready: false,

        reconnects: 0,

        status: CONNECTION.CONNECTING,
        stopSync

    };



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

    setSession(key, session);



    sock.ev.on(

        "creds.update",

        saveCreds

    );



    sock.ev.on(

        "connection.update",

        async (update) => {

            const {

                connection,

                qr,

                lastDisconnect

            } = update;



            console.log("WHATSAPP:", {

                connection,

                qr: !!qr,

                code:

                    lastDisconnect?.error?.output?.statusCode

            });



            if (qr) {

                session.qr =

                    await QRCode.toDataURL(qr);

                session.status =

                    CONNECTION.QR_READY;

            }



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

                            connectionStatus: "CONNECTED",

                            sessionReady: true,

                            lastConnected: new Date()

                        }

                    });

                } catch (err) {

                    console.error(

                        "DB update:",

                        err.message

                    );

                }



                console.log(

                    "CONNECTED:",

                    key

                );



                return;

            }



            if (connection !== "close") {

                return;

            }



            session.ready = false;

            session.status =

                CONNECTION.OFFLINE;



            const code =

                lastDisconnect?.error?.output?.statusCode;



            console.log(

                "Disconnected:",

                code

            );



            if (

                code === DisconnectReason.loggedOut

            ) {

                console.log(

                    "Logged out:",

                    key

                );



                removeSession(key);



                try {

                    await prisma.deployment.update({

                        where: {

                            id: key

                        },

                        data: {

                            status: "STOPPED",

                            connectionStatus: "OFFLINE",

                            sessionReady: false

                        }

                    });

                } catch {}



                return;

            }



            session.reconnects++;



            console.log(

                "Reconnect attempt",

                session.reconnects

            );



            clearReconnectTimer(key);



            const timer = setTimeout(

                async () => {

                    try {

                        removeSession(key);

                    } catch {}

                },

                RECONNECT_DELAY

            );



            setReconnectTimer(

                key,

                timer

            );

        }

    );



    sock.ev.on(

        "messages.upsert",

        async ({ messages }) => {

            if (!messages?.length) {

                return;

            }



            for (const message of messages) {

                try {

                    const { handleMessage } =

                        await import("../messageService.js");



                    await handleMessage(

                        sock,

                        message

                    );

                } catch (err) {

                    console.error(

                        "Message handler:",

                        err.message

                    );

                }

            }

        }

    );



    return session;

}



export async function destroySocket(

    deploymentId,

    logout = false

) {

    const key = String(deploymentId);

    const session = getSession(key);



    if (!session) {

        return;

    }



    clearReconnectTimer(key);



    try {

        if (logout) {

            await session.sock.logout();

        } else {

            session.sock.end?.();

        }

    } catch {}

    if (session.stopSync) {
    session.stopSync();
}



    removeSession(key);

}



export function getSocket(

    deploymentId

) {

    return getSession(

        deploymentId

    );

}