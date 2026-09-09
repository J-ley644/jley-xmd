import { handleCommand } from "../../../bot/core/commandHandler.js";
import loadPlugins from "../../../bot/core/pluginLoader.js";
import config from "../../../bot/config/config.js";
import automationStore from "../../../bot/system/automationStore.js";
import relationshipTracker from "../../../bot/system/relationshipTracker.js";

import groupSettings from "../../../bot/system/groupSettings.js";
import { containsLink } from "../../../bot/lib/antilink.js";

import {
    isEnabled,
    storeMessage,
    markDeleted
} from "../../../bot/system/antideleteStore.js";


/* =========================================================
   DEPLOYMENT ID
========================================================= */

function getDeploymentId(sock) {
    return String(
        sock?.deploymentId ||
        "main"
    );
}


/* =========================================================
   TEXT EXTRACTION
========================================================= */

function extractText(message) {
    const msg = message?.message;

    if (!msg) return "";

    return (
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        msg.documentMessage?.caption ||
        msg.buttonsResponseMessage?.selectedButtonId ||
        msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
        msg.templateButtonReplyMessage?.selectedId ||
        ""
    );
}


/* =========================================================
   AUTO TYPING
========================================================= */

async function startAutoTyping(sock, chat) {
    try {
        const settings = automationStore.get(chat);

        if (!settings?.autotyping) {
            return;
        }

        await sock.sendPresenceUpdate(
            "composing",
            chat
        );

        setTimeout(async () => {
            try {
                await sock.sendPresenceUpdate(
                    "paused",
                    chat
                );
            } catch {}
        }, 2500);

    } catch (error) {
        console.error(
            "AutoTyping error:",
            error?.message || error
        );
    }
}


/* =========================================================
   AUTO RECORDING
========================================================= */

async function startAutoRecording(sock, chat) {
    try {
        const settings = automationStore.get(chat);

        if (!settings?.autorecording) {
            return;
        }

        await sock.sendPresenceUpdate(
            "recording",
            chat
        );

        setTimeout(async () => {
            try {
                await sock.sendPresenceUpdate(
                    "paused",
                    chat
                );
            } catch {}
        }, 2500);

    } catch (error) {
        console.error(
            "AutoRecording error:",
            error?.message || error
        );
    }
}


/* =========================================================
   RELATIONSHIP TRACKING
========================================================= */

async function trackRelationship(
    deploymentId,
    message,
    chat,
    sender,
    text
) {
    try {
        if (!text) return;

        await relationshipTracker.trackMessage(
            deploymentId,
            message,
            chat,
            sender,
            text
        );

    } catch (error) {
        console.error(
            "Relationship tracking error:",
            error?.message || error
        );
    }
}


/* =========================================================
   ANTI-LINK
========================================================= */

async function enforceAntiLink(
    sock,
    message,
    chat,
    sender,
    text
) {
    if (!chat?.endsWith("@g.us")) {
        return false;
    }

    if (!text?.trim()) {
        return false;
    }

    if (message?.key?.fromMe) {
        return false;
    }

    const settings = groupSettings.get(chat);

    if (!settings?.antilink) {
        return false;
    }

    if (!containsLink(text)) {
        return false;
    }

    try {
        const metadata = await sock.groupMetadata(chat);

        const participant =
            metadata?.participants?.find(
                p =>
                    p?.id === sender ||
                    p?.lid === sender ||
                    p?.phoneNumber === sender ||
                    p?.id === message?.key?.participant
            );

        const isAdmin =
            participant?.admin === "admin" ||
            participant?.admin === "superadmin";

        /*
         * Never remove links sent by group admins.
         */
        if (isAdmin) {
            return false;
        }

        /*
         * Delete offending message.
         */
        await sock.sendMessage(chat, {
            delete: message.key
        });

        /*
         * Warn sender.
         */
        await sock.sendMessage(chat, {
            text:
`🚫 *ANTI-LINK*

Links are not allowed in this group.

@${String(sender).split("@")[0]}, please remove the link.`,
            mentions: [sender]
        });

        console.log(
            `[Anti-Link] Removed link from ${sender} in ${chat}`
        );

        return true;

    } catch (error) {
        console.error(
            "Anti-link error:",
            error?.message || error
        );

        return false;
    }
}


/* =========================================================
   ANTIDELETE LISTENER
========================================================= */

const antiDeleteListeners = new WeakSet();

function installAntiDeleteListener(sock) {
    if (!sock || antiDeleteListeners.has(sock)) {
        return;
    }

    antiDeleteListeners.add(sock);

    sock.ev.on(
        "messages.update",
        async updates => {
            try {
                for (const update of updates || []) {
                    const key = update?.key;

                    if (!key) {
                        continue;
                    }

                    /*
                     * WhatsApp deleted-message update.
                     */
                    const messageUpdate =
                        update?.update?.message;

                    if (
                        !messageUpdate &&
                        !update?.update?.messageStubType
                    ) {
                        continue;
                    }

                    const deploymentId =
                        getDeploymentId(sock);

                    const enabled =
                        isEnabled(deploymentId);

                    if (!enabled) {
                        continue;
                    }

                    /*
                     * Recover the stored message.
                     */
                    const stored =
                        markDeleted(
                            deploymentId,
                            key
                        );

                    if (!stored) {
                        continue;
                    }

                    const chat =
                        stored?.key?.remoteJid ||
                        key?.remoteJid;

                    if (!chat) {
                        continue;
                    }

                    const originalMessage =
                        stored?.message ||
                        stored;

                    if (!originalMessage) {
                        continue;
                    }

                    try {
                        await sock.sendMessage(
                            chat,
                            {
                                text:
`🛡️ *ANTI-DELETE*

A deleted message was detected.

👤 Sender:
@${String(
    key?.participant ||
    key?.remoteJid ||
    ""
).split("@")[0]}

📩 Message:
${extractText({
    message: originalMessage
}) || "[Media / Unsupported message]"}`,
                                mentions: [
                                    key?.participant ||
                                    key?.remoteJid
                                ].filter(Boolean)
                            }
                        );

                    } catch (error) {
                        console.error(
                            "AntiDelete recovery error:",
                            error?.message || error
                        );
                    }
                }

            } catch (error) {
                console.error(
                    "AntiDelete update error:",
                    error?.message || error
                );
            }
        }
    );
}


/* =========================================================
   MESSAGE HANDLER
========================================================= */

export async function handleMessage(
    sock,
    message
) {
    try {
        if (!sock || !message) {
            return;
        }

        /*
         * Install AntiDelete listener once per socket.
         */
        installAntiDeleteListener(sock);

        /*
         * Capture incoming messages for AntiDelete.
         */
        try {
            const deploymentId =
                getDeploymentId(sock);

            const enabled =
                isEnabled(deploymentId);

            if (enabled) {
                storeMessage(
                    deploymentId,
                    message
                );
            }
        } catch (error) {
            console.error(
                "AntiDelete store error:",
                error?.message || error
            );
        }


        /* =====================================================
           CHAT / SENDER
        ===================================================== */

        const jid =
            message?.key?.remoteJid;

        if (!jid) {
            return;
        }

        const sender =
            message?.key?.participant ||
            jid;

        const text =
            extractText(message);


        /* =====================================================
           RELATIONSHIP TRACKING
        ===================================================== */

        if (text) {
            await trackRelationship(
                getDeploymentId(sock),
                message,
                jid,
                sender,
                text
            );
        }


        /* =====================================================
           AUTO RECORDING
        ===================================================== */

        await startAutoRecording(
            sock,
            jid
        );


        /* =====================================================
           AUTO TYPING
        ===================================================== */

        await startAutoTyping(
            sock,
            jid
        );


        /* =====================================================
           EMPTY MESSAGE
        ===================================================== */

        if (!text?.trim()) {
            return;
        }


        /* =====================================================
           ANTI-LINK
           
           IMPORTANT:
           This runs BEFORE the command engine so a message
           containing a link can be deleted immediately.
        ===================================================== */

        const removed =
            await enforceAntiLink(
                sock,
                message,
                jid,
                sender,
                text
            );

        if (removed) {
            return;
        }


        /* =====================================================
           IGNORE BOT'S OWN NON-COMMAND MESSAGES
        ===================================================== */

        if (
            message?.key?.fromMe &&
            !text.startsWith(
                config.prefix || "."
            )
        ) {
            return;
        }


        /* =====================================================
           LOAD PLUGINS
        ===================================================== */

        const plugins =
            await loadPlugins();


        /* =====================================================
           COMMAND ENGINE
        ===================================================== */

        await handleCommand(
            sock,
            message,
            plugins
        );

    } catch (error) {
        console.error(
            "Message handler:",
            error?.message || error
        );
    }
}