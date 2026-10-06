import automationStore from "../../system/automationStore.js";
import { isStatus } from "./helpers.js";

const REACT_EMOJIS = [
    "❤️",
    "🔥",
    "😍",
    "😂",
    "👍",
    "👏",
    "🤩",
    "🥰",
    "💯",
    "✨"
];

/*
 * Resolve the phone JID that WhatsApp expects
 * for status reactions.
 *
 * LID status participants must NOT be placed
 * inside statusJidList.
 */
function resolvePhoneJid(key) {

    /*
     * Best source on modern Baileys:
     * participantPn = real phone JID.
     */
    if (
        key?.participantPn &&
        key.participantPn.includes(
            "@s.whatsapp.net"
        )
    ) {

        return key.participantPn;

    }

    /*
     * Normal non-LID status.
     */
    if (
        key?.participant &&
        key.participant.includes(
            "@s.whatsapp.net"
        )
    ) {

        return key.participant;

    }

    /*
     * Some message versions may expose
     * senderPn instead.
     */
    if (
        key?.senderPn &&
        key.senderPn.includes(
            "@s.whatsapp.net"
        )
    ) {

        return key.senderPn;

    }

    return null;
}


/*
 * Convert the bot's device JID:
 *
 * 254700000000:12@s.whatsapp.net
 *
 * into:
 *
 * 254700000000@s.whatsapp.net
 */
function getBotPhone(socket) {

    const botJid =
        socket?.user?.id ||
        "";

    if (!botJid) {
        return null;
    }

    return botJid.replace(
        /:\d+@/,
        "@"
    );

}


async function handleAutoLike(
    socket,
    message
) {

    try {

        if (!isStatus(message)) {
            return;
        }

        const key =
            message?.key;

        if (!key?.id) {

            console.log(
                "[AUTOLIKE] Status has no message ID."
            );

            return;

        }

        const botIdentity =
            socket?.user?.lid ||
            socket?.user?.id ||
            null;

        if (!botIdentity) {

            console.log(
                "[AUTOLIKE] Unable to identify bot."
            );

            return;

        }

        const settings =
            automationStore.get(
                botIdentity
            );

        if (!settings?.autolike) {
            return;
        }

        /*
         * Original status key MUST be preserved.
         */
        const participant =
            key?.participant ||
            message?.participant ||
            null;

        if (!participant) {

            console.log(
                "[AUTOLIKE] No status participant."
            );

            return;

        }

        /*
         * Resolve the sender to their PHONE JID.
         *
         * This is the critical LID fix.
         */
        const phoneJid =
            resolvePhoneJid(key);

        const botPhone =
            getBotPhone(socket);

        /*
         * WhatsApp expects phone JIDs here.
         *
         * Never intentionally put @lid into
         * statusJidList.
         */
        const statusJidList = [
            phoneJid,
            botPhone
        ].filter(
            jid =>
                jid &&
                jid.includes(
                    "@s.whatsapp.net"
                )
        );

        if (
            statusJidList.length === 0
        ) {

            console.log(
                "[AUTOLIKE] ❌ No phone JID available for status reaction.",
                {
                    participant,
                    participantPn:
                        key?.participantPn
                }
            );

            return;

        }

        const emoji =
            settings.autolikeEmoji ||
            REACT_EMOJIS[
                Math.floor(
                    Math.random() *
                    REACT_EMOJIS.length
                )
            ];

        console.log(
            "[AUTOLIKE] Reacting:",
            {
                statusId:
                    key.id,

                participant,

                phoneJid,

                botPhone,

                statusJidList,

                emoji
            }
        );

        /*
         * ALSON's working technique:
         *
         * - destination = status@broadcast
         * - reaction key = ORIGINAL status key
         * - statusJidList = PHONE JIDs
         */
        try {

            await socket.sendMessage(
                "status@broadcast",
                {
                    react: {
                        text:
                            emoji,

                        key:
                            key
                    }
                },
                {
                    statusJidList
                }
            );

            console.log(
                "[AUTOLIKE] ✅ Status reaction sent."
            );

            return;

        } catch (error) {

            console.log(
                "[AUTOLIKE] Primary reaction failed:",
                error?.message ||
                error
            );

        }

        /*
         * Fallback for Baileys builds that behave
         * differently with statusJidList placement.
         */
        try {

            await socket.sendMessage(
                "status@broadcast",
                {
                    react: {
                        text:
                            emoji,

                        key:
                            key
                    },

                    statusJidList
                }
            );

            console.log(
                "[AUTOLIKE] ✅ Status reaction sent via fallback."
            );

        } catch (error) {

            console.error(
                "[AUTOLIKE] ❌ Reaction failed:",
                error?.message ||
                error
            );

        }

    } catch (error) {

        console.error(
            "[AUTOLIKE] Handler error:",
            error?.message ||
            error
        );

    }

}

export default handleAutoLike;