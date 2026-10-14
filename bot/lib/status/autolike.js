
import automationStore from "../../system/automationStore.js";
import { isStatus } from "./helpers.js";

const REACT_EMOJIS = [
    "❤️", "🔥", "😍", "😂", "👍",
    "👏", "🤩", "🥰", "💯", "✨"
];

function isPhoneJid(jid) {
    return typeof jid === "string" &&
        jid.includes("@s.whatsapp.net");
}

function getBotPhone(socket) {
    const botJid = socket?.user?.id || "";
    return botJid ? botJid.replace(/:\d+@/, "@") : null;
}

async function resolvePhoneJid(socket, key, message) {
    const candidates = [
        key?.participantPn,
        key?.participant,
        key?.senderPn,
        message?.participantPn,
        message?.senderPn
    ];

    for (const jid of candidates) {
        if (isPhoneJid(jid)) return jid;
    }

    const lid = [
        key?.participant,
        message?.participant
    ].find(jid =>
        typeof jid === "string" &&
        jid.includes("@lid")
    );

    if (lid) {
        try {
            const mapped =
                await socket?.signalRepository?.lidMapping?.getPNForLID?.(lid);

            if (isPhoneJid(mapped)) return mapped;
        } catch (error) {
            console.log(
                "[AUTOLIKE] LID lookup failed:",
                error?.message || error
            );
        }

        const mapping = globalThis.lidJidMap;
        const legacy = mapping
            ? (
                typeof mapping.get === "function"
                    ? mapping.get(lid)
                    : mapping[lid]
            )
            : null;

        if (isPhoneJid(legacy)) return legacy;
    }

    return null;
}

async function handleAutoLike(socket, message) {
    try {
        if (!isStatus(message)) return;

        const key = message?.key;

        if (!key?.id) {
            console.log("[AUTOLIKE] Status has no message ID.");
            return;
        }

        // Must match the key used by the automation commands.
        const botIdentity =
            socket?.deploymentId ||
            null;

        if (!botIdentity) {
            console.log("[AUTOLIKE] Missing deployment ID.");
            return;
        }

        const settings = automationStore.get(botIdentity);

        if (!settings?.autolike) return;

        const participant =
            key?.participant ||
            message?.participant ||
            key?.participantPn ||
            null;

        if (!participant) {
            console.log("[AUTOLIKE] No status participant.");
            return;
        }

        const phoneJid = await resolvePhoneJid(
            socket,
            key,
            message
        );

        const botPhone = getBotPhone(socket);

        const statusJidList = [
            phoneJid,
            botPhone
        ].filter(isPhoneJid);

        if (statusJidList.length === 0) {
            console.log(
                "[AUTOLIKE] No phone JID available for reaction.",
                {
                    participant,
                    participantPn: key?.participantPn
                }
            );
            return;
        }

        const emoji =
            settings.autolikeEmoji ||
            REACT_EMOJIS[
                Math.floor(Math.random() * REACT_EMOJIS.length)
            ];

        console.log("[AUTOLIKE] Reacting:", {
            statusId: key.id,
            participant,
            phoneJid,
            botPhone,
            statusJidList,
            emoji
        });

        try {
            await socket.sendMessage(
                "status@broadcast",
                {
                    react: {
                        text: emoji,
                        key
                    }
                },
                {
                    statusJidList
                }
            );

            console.log("[AUTOLIKE] Status reaction sent.");
            return;
        } catch (error) {
            console.log(
                "[AUTOLIKE] Primary reaction failed:",
                error?.message || error
            );
        }

        try {
            await socket.sendMessage(
                "status@broadcast",
                {
                    react: {
                        text: emoji,
                        key
                    },
                    statusJidList
                }
            );

            console.log(
                "[AUTOLIKE] Status reaction sent via fallback."
            );
        } catch (error) {
            console.error(
                "[AUTOLIKE] Reaction failed:",
                error?.message || error
            );
        }
    } catch (error) {
        console.error(
            "[AUTOLIKE] Handler error:",
            error?.message || error
        );
    }
}

export default handleAutoLike;
