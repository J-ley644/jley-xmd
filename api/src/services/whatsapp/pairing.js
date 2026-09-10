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


/*
 * Create or restore a WhatsApp session.
 */
export async function createSession(
    deploymentId,
    phoneNumber = null
) {

    const key = String(deploymentId);


    /*
     * Pairing-code mode.
     *
     * When a phone number is supplied, we intentionally
     * create a fresh authentication session.
     */
    if (phoneNumber) {

        const existing =
            getSocket(key);


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
         * Remove previous authentication files so
         * Baileys does not restore an old account.
         */
        deleteSessionFolder(key);

    } else {

        /*
         * Normal deployment startup.
         *
         * If a socket already exists, reuse it.
         */
        const existing =
            getSocket(key);


        if (existing) {

            return existing;

        }

    }


    /*
     * Prevent multiple simultaneous session
     * creation requests for the same deployment.
     */
    if (hasLock(key)) {

        return getLock(key);

    }


    const promise =
        (async () => {

            const {
                state,
                saveCreds,
                stopSync
            } = await getAuthState(key);


            /*
             * IMPORTANT:
             *
             * Pass phoneNumber here.
             *
             * Do NOT use normalizedPhone because that
             * variable only exists inside requestPairingCode().
             */
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


/*
 * Start a normal deployment session.
 *
 * Used for QR pairing / normal bot startup.
 */
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
            session.qr || null

    };

}


/*
 * Get the current deployment status.
 */
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
 * socket.js is responsible for actually calling
 * sock.requestPairingCode().
 *
 * This function waits for socket.js to populate
 * session.code.
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
     * Convert the supplied number into digits only.
     *
     * Example:
     *
     * +254 712 345 678
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
            deploymentId:
                String(deploymentId),

            phoneNumber:
                normalizedPhone
        }
    );


    /*
     * Create a fresh pairing session.
     *
     * socket.js receives the normalized number and
     * handles the actual Baileys pairing request.
     */
    const session =
        await createSession(
            deploymentId,
            normalizedPhone
        );


    if (!session) {

        throw new Error(
            "WhatsApp pairing session could not be created."
        );

    }


    if (!session.sock) {

        throw new Error(
            "WhatsApp socket unavailable."
        );

    }


    /*
     * Wait for socket.js to populate session.code.
     *
     * 30 × 500ms = 15 seconds.
     *
     * We deliberately DO NOT treat a temporary missing
     * socket as an immediate failure. The socket may still
     * be initializing.
     */
    let attempts = 0;

    const maxAttempts = 30;


    while (
        !session.code &&
        attempts < maxAttempts
    ) {

        await sleep(500);

        attempts++;


        /*
         * Check the latest session object.
         *
         * This is important because socket.js may update
         * the session object while the pairing request is
         * being processed.
         */
        const currentSession =
            getSocket(
                deploymentId
            );


        /*
         * If a newer session exists, use it.
         */
        if (currentSession) {

            if (currentSession.code) {

                console.log(
                    "PAIRING CODE READY:",
                    currentSession.code
                );


                return {

                    code:
                        currentSession.code

                };

            }

        }


        /*
         * Also check the original session because
         * socket.js normally updates this same object.
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

    }


    /*
     * Final check after the waiting period.
     */
    const finalSession =
        getSocket(
            deploymentId
        );


    if (finalSession?.code) {

        console.log(
            "PAIRING CODE READY:",
            finalSession.code
        );


        return {

            code:
                finalSession.code

        };

    }


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


/*
 * Stop a deployment session.
 */
export async function stopDeploymentSession(
    deploymentId
) {

    await destroySocket(
        deploymentId,
        true
    );


    return true;

}

