import automationStore from "../../system/automationStore.js";

import {
    isStatus
} from "./helpers.js";


async function handleAutoView(
    socket,
    message
) {

    console.log(
        "[AUTOVIEW] Event received:",
        {
            remoteJid:
                message?.key?.remoteJid,

            topLevelParticipant:
                message?.participant,

            participantPn:
                message?.key?.participantPn,

            keyParticipant:
                message?.key?.participant,

            messageId:
                message?.key?.id,

            detected:
                isStatus(message)
        }
    );


    /*
    |--------------------------------------------------------------------------
    | Status Detection
    |--------------------------------------------------------------------------
    */

    if (!isStatus(message)) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Bot Identity
    |--------------------------------------------------------------------------
    |
    | This MUST match the identity used by autoview.js when
    | saving the setting.
    |
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
    | Load Automation Settings
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


    if (!settings?.autoview) {

        console.log(
            "[AUTOVIEW] Disabled."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Validate Original Message Key
    |--------------------------------------------------------------------------
    */

    if (!message?.key?.id) {

        console.log(
            "[AUTOVIEW] Status has no message ID."
        );

        return;

    }


    if (
        message?.key?.remoteJid !==
        "status@broadcast"
    ) {

        console.log(
            "[AUTOVIEW] Invalid status remote JID."
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | CRITICAL:
    |
    | Keep the ORIGINAL Baileys message key.
    |
    | Do NOT:
    |   - resolve @lid to @s.whatsapp.net
    |   - rebuild the key
    |   - replace key.participant
    |
    | Baileys v7 may require the original LID participant
    | for Signal/encryption lookup.
    |--------------------------------------------------------------------------
    */

    const readKey =
        message.key;


    console.log(
        "[AUTOVIEW] Attempting to view status using ORIGINAL key:",
        {
            remoteJid:
                readKey?.remoteJid,

            participant:
                readKey?.participant,

            participantPn:
                readKey?.participantPn,

            id:
                readKey?.id,

            fromMe:
                readKey?.fromMe
        }
    );


    /*
    |--------------------------------------------------------------------------
    | View Status
    |--------------------------------------------------------------------------
    */

    try {

        await socket.readMessages([
            readKey
        ]);


        console.log(
            "[AUTOVIEW] Status viewed successfully."
        );


    } catch (error) {

        console.error(
            "[AUTOVIEW] Failed to view status:",
            error?.message ||
            error
        );


        /*
        |--------------------------------------------------------------------------
        | Fallback
        |--------------------------------------------------------------------------
        |
        | Some Baileys/WhatsApp combinations may reject readMessages().
        | Try the read receipt using the ORIGINAL participant.
        |
        */

        try {

            const participant =
                readKey?.participant ||
                readKey?.participantPn;


            if (!participant) {

                console.log(
                    "[AUTOVIEW] No participant available for read receipt."
                );

                return;

            }


            await socket.sendReadReceipt(
                "status@broadcast",
                participant,
                [
                    readKey.id
                ]
            );


            console.log(
                "[AUTOVIEW] Status read receipt sent successfully."
            );


        } catch (fallbackError) {

            console.error(
                "[AUTOVIEW] Read receipt fallback failed:",
                fallbackError?.message ||
                fallbackError
            );

        }

    }

}


export default handleAutoView;