import {
    createSocket,
    destroySocket,
    getSocket
} from "./socket.js";

import {
    getAuthState,
    deleteSessionFolder
} from "./sessionStore.js";

import {
    hasLock,
    getLock,
    setLock,
    clearLock
} from "./manager.js";


const sleep = ms =>
    new Promise(resolve => setTimeout(resolve, ms));


export async function createSession(
    deploymentId,
    phoneNumber = null
) {

    const key = String(deploymentId);


    /*
     * Pairing-code mode.
     *
     * We intentionally create a fresh WhatsApp
     * authentication session for the number being paired.
     */
    if (phoneNumber) {

        const existing = getSocket(key);

        if (existing) {

            try {

                await destroySocket(
                    key,
                    true
                );

            } catch (error) {

                console.error(
                    "Existing socket cleanup error:",
                    error.message
                );

            }

        }


        /*
         * Remove old authentication files.
         *
         * This prevents Baileys from restoring an
         * already-linked WhatsApp account instead of
         * starting the requested pairing flow.
         */
        deleteSessionFolder(key);

    } else {

        /*
         * Normal deployment startup.
         */
        const existing = getSocket(key);

        if (existing) {

            return existing;

        }

    }


    /*
     * Prevent two simultaneous session creation
     * operations for the same deployment.
     */
    if (hasLock(key)) {

        return getLock(key);

    }


    const promise = (async () => {

        const {
            state,
            saveCreds,
            stopSync
        } = await getAuthState(key);


        return createSocket(
            key,
            state,
            saveCreds,
            phoneNumber,
            stopSync
        );

    })();


    setLock(
        key,
        promise
    );


    try {

        return await promise;

    } finally {

        clearLock(key);

    }

}


export async function startDeploymentSession(
    deploymentId
) {

    const session =
        await createSession(
            deploymentId
        );


    return {

        deploymentId,

        status:
            session.status,

        qr:
            session.qr

    };

}


export async function getDeploymentStatus(
    deploymentId
) {

    const session =
        getSocket(
            deploymentId
        );


    if (!session) {

        return {

            status: "OFFLINE",

            qr: null,

            code: null

        };

    }


    return {

        status:
            session.status,

        qr:
            session.qr || null,

        code:
            session.code || null

    };

}


/*
 * Request a WhatsApp pairing code.
 *
 * The socket.js createSocket() function is responsible
 * for creating the socket and requesting the actual code.
 *
 * This function waits long enough for the asynchronous
 * WhatsApp connection events to populate session.code.
 */
export async function requestPairingCode(
    deploymentId,
    phoneNumber
) {

    if (!phoneNumber) {

        throw new Error(
            "Phone number is required."
        );

    }


    /*
     * Normalize the number here as well as inside
     * socket.js so the API always works with digits.
     *
     * Example:
     *
     * +254712345678
     *
     * becomes:
     *
     * 254712345678
     */
    const normalizedPhone =
        String(phoneNumber)
            .replace(/\D/g, "");


    if (!normalizedPhone) {

        throw new Error(
            "Invalid phone number."
        );

    }


    if (
        normalizedPhone.length < 8 ||
        normalizedPhone.length > 15
    ) {

        throw new Error(
            "Invalid phone number. Use the full international number."
        );

    }


    console.log(
        "PAIRING REQUEST:",
        {
            deploymentId: String(deploymentId),
            phoneNumber: normalizedPhone
        }
    );


    /*
     * createSession(phoneNumber) creates a fresh
     * socket and passes the number into socket.js.
     */
    const session =
        await createSession(
            deploymentId,
            normalizedPhone
        );


    if (!session?.sock) {

        throw new Error(
            "WhatsApp socket unavailable."
        );

    }


    /*
     * socket.js performs:
     *
     *     sock.requestPairingCode(...)
     *
     * asynchronously.
     *
     * Wait for session.code to appear.
     *
     * 30 attempts × 500ms = 15 seconds.
     */
    let attempts = 0;

    const maxAttempts = 30;


    while (
        !session.code &&
        attempts < maxAttempts
    ) {

        /*
         * If the socket disappears while waiting,
         * fail immediately instead of waiting the
         * entire timeout.
         */
        const currentSession =
            getSocket(
                deploymentId
            );


        if (
            !currentSession
        ) {

            throw new Error(
                "WhatsApp pairing session ended unexpectedly."
            );

        }


        /*
         * If the socket is already connected,
         * pairing mode has failed because WhatsApp
         * completed another authentication path.
         */
        if (
            currentSession.ready &&
            !currentSession.code
        ) {

            break;

        }


        await sleep(500);

        attempts++;

    }


    /*
     * Return the generated pairing code.
     */
    if (session.code) {

        console.log(
            "PAIRING CODE READY:",
            session.code
        );


        return {

            code:
                session.code

        };

    }


    throw new Error(
        "Pairing code was not generated. Please try again."
    );

}


export async function stopDeploymentSession(
    deploymentId
) {

    await destroySocket(
        deploymentId,
        true
    );


    return true;

}