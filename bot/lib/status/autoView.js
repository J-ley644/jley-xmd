import automationStore from "../../system/automationStore.js";

import {
    isStatus
} from "./helpers.js";


/**
 * Resolve a WhatsApp LID to its real phone JID.
 *
 * Baileys v7 provides the native LID mapping store:
 *
 * signalRepository.lidMapping.getPNForLID()
 *
 * If resolution fails, we keep the original JID as
 * a best-effort fallback.
 */
async function resolveParticipant(
    socket,
    participant
) {

    if (!participant) {
        return null;
    }

    // Already a normal WhatsApp phone JID
    if (!participant.endsWith("@lid")) {
        return participant;
    }

    try {

        const lidMapping =
            socket?.signalRepository?.lidMapping;

        if (!lidMapping) {
            console.log(
                "[AUTOVIEW] Baileys LID mapping unavailable."
            );

            return participant;
        }

        const resolved =
            await lidMapping.getPNForLID(
                participant
            );

        if (
            resolved &&
            typeof resolved === "string" &&
            !resolved.endsWith("@lid")
        ) {

            console.log(
                "[AUTOVIEW] LID resolved:",
                participant,
                "→",
                resolved
            );

            return resolved;
        }

    } catch (error) {

        console.error(
            "[AUTOVIEW] LID resolution failed:",
            error?.message || error
        );
    }

    return participant;
}


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


    if (!isStatus(message)) {
        return;
    }


    /*
     * Atassa's implementation shows that the status
     * sender can exist at different locations.
     *
     * Prefer the top-level participant.
     */
    const rawParticipant =
        message?.participant ||
        message?.key?.participantPn ||
        message?.key?.participant ||
        null;


    console.log(
        "[AUTOVIEW] Raw participant:",
        rawParticipant
    );


    const participantJid =
        await resolveParticipant(
            socket,
            rawParticipant
        );


    console.log(
        "[AUTOVIEW] Resolved participant:",
        participantJid
    );


    /*
     * Identify this bot account.
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
     * Load automation settings.
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


    if (!message?.key?.id) {

        console.log(
            "[AUTOVIEW] Status has no message ID."
        );

        return;
    }


    /*
     * Build the status read key.
     *
     * If WhatsApp supplied a LID participant but
     * Baileys knows the real phone JID, use the
     * resolved participant.
     */
    let readKey = message.key;


    if (
        participantJid &&
        participantJid !== message?.key?.participant
    ) {

        readKey = {
            ...message.key,
            participant: participantJid
        };

    }


    console.log(
        "[AUTOVIEW] Attempting to view status:",
        readKey
    );


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
            error?.message || error
        );

    }

}


export default handleAutoView;