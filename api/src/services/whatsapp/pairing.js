import {

    createSocket,

    destroySocket,

    getSocket

} from "./socket.js";

import {

    getAuthState

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



    const existing =

        getSocket(key);

    if (existing) {

        return existing;

    }



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

    }

    finally {

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

        status: session.status,

        qr: session.qr

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

        status: session.status,

        qr: session.qr || null,

        code: session.code || null

    };

}





export async function requestPairingCode(

    deploymentId,

    phoneNumber

) {

    const session =

        await createSession(

            deploymentId,

            phoneNumber

        );



    if (!session?.sock) {

        throw new Error(

            "WhatsApp socket unavailable"

        );

    }



    if (!session.code) {

        throw new Error(

            "Pairing code was not generated."

        );

    }



    session.qr = null;



    session.status =

        "CONNECTING";



    console.log(

        "PAIRING CODE READY:",

        session.code

    );



    return {

        code: session.code

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