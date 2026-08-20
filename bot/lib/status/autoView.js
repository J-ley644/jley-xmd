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
    | STATUS DIAGNOSTIC
    |--------------------------------------------------------------------------
    */

    console.log(
        "[AUTOVIEW] Event received:",
        {
            remoteJid:
                message?.key?.remoteJid,

            participant:
                message?.key?.participant,

            messageId:
                message?.key?.id,

            detected:
                isStatus(message)
        }
    );


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
    | Bot Identity
    |--------------------------------------------------------------------------
    */

    const botLid =
        socket?.user?.lid ||
        null;

    const botId =
        socket?.user?.id ||
        null;

    const botIdentity =
        botLid ||
        botId ||
        null;


    console.log(
        "[AUTOVIEW] Bot identity:",
        {
            botId,
            botLid,
            botIdentity
        }
    );


    if (!botIdentity) {

        console.log(
            "[AUTOVIEW] No bot identity detected."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Read Configuration
    |--------------------------------------------------------------------------
    */

    const settings =
        automationStore.get(
            botIdentity
        );


    console.log(
        "[AUTOVIEW] Settings:",
        settings
    );


    if (
        !settings?.autoview
    ) {

        console.log(
            "[AUTOVIEW] Disabled."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Status Key
    |--------------------------------------------------------------------------
    */

    if (
        !message?.key?.id
    ) {

        console.log(
            "[AUTOVIEW] Status has no message ID."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Mark Status As Read
    |--------------------------------------------------------------------------
    */

    try {

        console.log(
            "[AUTOVIEW] Attempting to view status:",
            message.key
        );


        await socket.readMessages([
            message.key
        ]);


        console.log(
            "[AUTOVIEW] Status viewed successfully."
        );

    }

    catch (error) {

        console.error(
            "[AUTOVIEW] Failed:",
            error?.message ||
            error
        );

    }

}


export default handleAutoView;
