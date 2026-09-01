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


export async function createSession(
    deploymentId,
    phoneNumber = null
) {

    const key = String(deploymentId);

    /*
     * If a phone number was supplied, we are explicitly
     * requesting a NEW pairing-code flow.
     *
     * Do not return an already-existing socket here.
     */

    if (phoneNumber) {

        const existing = getSocket(key);

        if (existing) {

            try {
                await destroySocket(key, true);
            } catch (error) {
                console.error(
                    "Existing socket cleanup error:",
                    error.message
                );
            }

        }

        /*
         * Remove the old authentication files so Baileys
         * cannot restore the previous WhatsApp account.
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


export async function requestPairingCode(
    deploymentId,
    phoneNumber
) {

    if (!phoneNumber) {

        throw new Error(
            "Phone number is required."
        );

    }


    const session =
        await createSession(
            deploymentId,
            phoneNumber
        );


    if (!session?.sock) {

        throw new Error(
            "WhatsApp socket unavailable."
        );

    }


    /*
     * createSocket() handles the actual
     * requestPairingCode() call.
     *
     * Give the socket a moment to populate
     * the session object if necessary.
     */

    let attempts = 0;

    while (
        !session.code &&
        attempts < 20
    ) {

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    500
                )
        );

        attempts++;

    }


    if (!session.code) {

        throw new Error(
            "Pairing code was not generated."
        );

    }


    return {

        code:
            session.code

    };

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