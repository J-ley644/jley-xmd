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

async function handleAutoLike(socket, message) {

    try {

        // Only process WhatsApp Status updates
        if (!isStatus(message)) {
            return;
        }

        const key = message?.key;

        if (!key?.id) {
            console.log("[AUTOLIKE] Status has no message ID");
            return;
        }

        // Keep the ORIGINAL participant JID.
        // Do not convert @lid to @s.whatsapp.net.
        const participantJid =
            key?.participant ||
            message?.participant ||
            null;

        if (!participantJid) {
            console.log(
                "[AUTOLIKE] No status participant found"
            );
            return;
        }

        // Identify this specific bot/deployment
        const botIdentity =
            socket?.user?.lid ||
            socket?.user?.id ||
            null;

        if (!botIdentity) {
            console.log(
                "[AUTOLIKE] Unable to identify bot"
            );
            return;
        }

        const settings =
            automationStore.get(botIdentity);

        if (!settings?.autolike) {
            return;
        }

        // Use configured emoji
        const emoji =
            settings.autolikeEmoji ||
            REACT_EMOJIS[
                Math.floor(
                    Math.random() * REACT_EMOJIS.length
                )
            ];

        console.log(
            "[AUTOLIKE] Processing status:",
            participantJid,
            "emoji:",
            emoji
        );

        /*
         * Method A
         * Preferred Baileys status reaction method.
         */
        try {

            await socket.sendMessage(
                "status@broadcast",
                {
                    react: {
                        text: emoji,
                        key: key
                    }
                },
                {
                    statusJidList: [
                        participantJid
                    ]
                }
            );

            console.log(
                "[AUTOLIKE] Reaction sent successfully:",
                emoji,
                participantJid
            );

            return;

        } catch (errorA) {

            console.log(
                "[AUTOLIKE] Method A failed:",
                String(errorA).slice(0, 200)
            );
        }

        /*
         * Method B
         * Some Baileys versions accept statusJidList
         * inside the message object.
         */
        try {

            await socket.sendMessage(
                "status@broadcast",
                {
                    react: {
                        text: emoji,
                        key: key
                    },
                    statusJidList: [
                        participantJid
                    ]
                }
            );

            console.log(
                "[AUTOLIKE] Method B succeeded:",
                emoji,
                participantJid
            );

            return;

        } catch (errorB) {

            console.log(
                "[AUTOLIKE] Method B failed:",
                String(errorB).slice(0, 200)
            );
        }

        /*
         * Method C
         * Final fallback: react directly in the
         * participant's private chat.
         */
        try {

            const dmJid =
                participantJid.replace(
                    /:\d+@/,
                    "@"
                );

            await socket.sendMessage(
                dmJid,
                {
                    react: {
                        text: emoji,
                        key: key
                    }
                }
            );

            console.log(
                "[AUTOLIKE] Method C succeeded:",
                emoji,
                dmJid
            );

        } catch (errorC) {

            console.log(
                "[AUTOLIKE] All reaction methods failed:",
                String(errorC).slice(0, 250)
            );
        }

    } catch (error) {

        console.log(
            "[AUTOLIKE] Unexpected error:",
            String(error).slice(0, 250)
        );
    }
}

export default handleAutoLike;