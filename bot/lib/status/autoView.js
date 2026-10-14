import automationStore from "../../system/automationStore.js";
import { isStatus } from "./helpers.js";

function isPhoneJid(jid) {
    return (
        typeof jid === "string" &&
        /^\d+@s\.whatsapp\.net$/.test(jid)
    );
}

async function resolveParticipant(socket, key, message) {
    const candidates = [
        key?.participantPn,
        key?.participant,
        message?.participantPn,
        message?.participant
    ];

    // Prefer a real phone JID when WhatsApp provides one.
    for (const jid of candidates) {
        if (isPhoneJid(jid)) {
            return jid;
        }
    }

    // If only a LID is available, try Baileys' LID mapping.
    const lid = candidates.find(
        jid =>
            typeof jid === "string" &&
            jid.endsWith("@lid")
    );

    if (lid) {
        try {
            const mapped =
                await socket?.signalRepository
                    ?.lidMapping
                    ?.getPNForLID?.(lid);

            if (isPhoneJid(mapped)) {
                return mapped;
            }
        } catch (error) {
            console.log(
                "[AUTOVIEW] LID mapping failed:",
                error?.message || error
            );
        }

        // Support an existing application-level LID map.
        const mapping = globalThis.lidJidMap;

        const legacy = mapping
            ? typeof mapping.get === "function"
                ? mapping.get(lid)
                : mapping[lid]
            : null;

        if (isPhoneJid(legacy)) {
            return legacy;
        }

        // Preserve the original participant as a last resort.
        return lid;
    }

    return null;
}

async function handleAutoView(socket, message) {
    try {
        if (!isStatus(message)) return;

        const key = message?.key;

        if (!key?.id) {
            console.log("[AUTOVIEW] Status has no message ID.");
            return;
        }

        if (key.remoteJid !== "status@broadcast") return;

        const botIdentity =
            socket?.user?.lid ||
            socket?.user?.id ||
            null;

        if (!botIdentity) {
            console.log("[AUTOVIEW] Unable to identify bot.");
            return;
        }

        const settings = automationStore.get(botIdentity);

        if (!settings?.autoview) return;

        const participant = await resolveParticipant(
            socket,
            key,
            message
        );

        if (!participant) {
            console.log(
                "[AUTOVIEW] No status participant found."
            );
            return;
        }

        const statusId = key.id;

        console.log("[AUTOVIEW] Processing status receipt:", {
            statusId,
            participant,
            participantPn: key?.participantPn
        });

        if (typeof socket.sendReceipt === "function") {
            try {
                await socket.sendReceipt(
                    "status@broadcast",
                    participant,
                    [statusId],
                    "read"
                );

                console.log(
                    "[AUTOVIEW] Status viewed via sendReceipt."
                );
                return;
            } catch (error) {
                console.log(
                    "[AUTOVIEW] sendReceipt failed:",
                    error?.message || error
                );
            }
        }

        if (typeof socket.readMessages === "function") {
            try {
                await socket.readMessages([{
                    remoteJid: "status@broadcast",
                    id: statusId,
                    participant,
                    fromMe: false
                }]);

                console.log(
                    "[AUTOVIEW] Status viewed via readMessages."
                );
                return;
            } catch (error) {
                console.log(
                    "[AUTOVIEW] readMessages failed:",
                    error?.message || error
                );
            }
        }

        if (typeof socket.sendReadReceipt === "function") {
            try {
                await socket.sendReadReceipt(
                    "status@broadcast",
                    participant,
                    [statusId]
                );

                console.log(
                    "[AUTOVIEW] Status viewed via sendReadReceipt."
                );
                return;
            } catch (error) {
                console.log(
                    "[AUTOVIEW] sendReadReceipt failed:",
                    error?.message || error
                );
            }
        }

        console.error(
            "[AUTOVIEW] All status-view methods failed."
        );
    } catch (error) {
        console.error(
            "[AUTOVIEW] Handler error:",
            error?.message || error
        );
    }
}

export default handleAutoView;