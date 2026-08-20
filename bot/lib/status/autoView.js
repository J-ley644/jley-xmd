import automationStore from "../../system/automationStore.js";

import {
    isStatus
} from "./helpers.js";


async function handleAutoView(
    socket,
    message
) {

    /*
    |--------------------------------------------------------------------------
    | Only process WhatsApp status messages
    |--------------------------------------------------------------------------
    */

    if (
        !isStatus(message)
    ) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Identify the connected bot
    |--------------------------------------------------------------------------
    */

    const botLid =
    socket?.user?.lid ||
    null;

const botId =
    socket?.user?.id ||
    null;

const identities = [
    botId,
    botLid
].filter(Boolean);


if (!identities.length) {

    return;

}


/*
|--------------------------------------------------------------------------
| Read AutoView setting
|--------------------------------------------------------------------------
*/

let enabled = false;

for (const identity of identities) {

    const settings =
        automationStore.get(
            identity
        );

    if (settings?.autoview === true) {

        enabled = true;

        break;

    }

}


if (!enabled) {

    return;

}


    /*
    |--------------------------------------------------------------------------
    | Ignore invalid status events
    |--------------------------------------------------------------------------
    */

    if (
        !message?.key?.id
    ) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | View the status
    |--------------------------------------------------------------------------
    */

    try {

        await socket.readMessages([
            message.key
        ]);

    }

    catch (error) {

        console.error(
            "AutoView failed:",
            error?.message ||
            error
        );

    }

}


export default handleAutoView;