import { handleCommand } from "../../../bot/core/commandHandler.js";
import loadPlugins from "../../../bot/core/pluginLoader.js";
import config from "../../../bot/config/config.js";
import automationStore from "../../../bot/system/automationStore.js";
import relationshipTracker from "../../../bot/system/relationshipTracker.js";
import { jidMatch } from "../../../bot/lib/jid.js";

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
    /*
     * AntiLink only applies to groups.
     */
    if (!chat?.endsWith("@g.us")) {
        return false;
    }

    /*
     * Ignore empty messages.
     */
    if (!text?.trim()) {
        return false;
    }

    /*
     * Never moderate messages sent by the bot itself.
     */
    if (message?.key?.fromMe) {
        return false;
    }

    const settings = groupSettings.get(chat);

    console.log(
        "[Anti-Link] CHECK:",
        {
            chat,
            sender,
            enabled: !!settings?.antilink,
            text
        }
    );

    /*
     * AntiLink disabled.
     */
    if (!settings?.antilink) {
        return false;
    }

    /*
     * Detect actual links.
     */
    const hasLink = containsLink(text);

    console.log(
        "[Anti-Link] LINK DETECTION:",
        {
            chat,
            sender,
            hasLink
        }
    );

    if (!hasLink) {
        return false;
    }

    try {
        /*
         * Get complete group metadata.
         */
        const metadata =
            await sock.groupMetadata(chat);

        const participants =
            metadata?.participants || [];

        /*
         * Find sender using JLEY's robust
         * JID/LID matching system.
         */
        const senderParticipant =
            participants.find(
                participant =>
                    jidMatch(
                        participant?.id,
                        sender
                    ) ||
                    jidMatch(
                        participant?.lid,
                        sender
                    ) ||
                    jidMatch(
                        participant?.phoneNumber,
                        sender
                    ) ||
                    jidMatch(
                        participant?.id,
                        message?.key?.participant
                    )
            );

        /*
         * Determine whether sender is admin.
         */
        const senderIsAdmin =
            senderParticipant?.admin === "admin" ||
            senderParticipant?.admin === "superadmin";

        /*
         * Determine whether JLEY bot is admin.
         *
         * WhatsApp may expose the bot through either
         * phone JID or LID.
         */
        const botPhone =
            sock?.user?.id || "";

        const botLid =
            sock?.user?.lid || "";

        const botParticipant =
            participants.find(
                participant =>
                    jidMatch(
                        participant?.id,
                        botPhone
                    ) ||
                    jidMatch(
                        participant?.lid,
                        botPhone
                    ) ||
                    jidMatch(
                        participant?.id,
                        botLid
                    ) ||
                    jidMatch(
                        participant?.lid,
                        botLid
                    )
            );

        const botIsAdmin =
            botParticipant?.admin === "admin" ||
            botParticipant?.admin === "superadmin";

        console.log(
            "[Anti-Link] ADMIN CHECK:",
            {
                sender,
                senderParticipant,
                senderIsAdmin,
                botPhone,
                botLid,
                botParticipant,
                botIsAdmin
            }
        );

        /*
         * Group admins are protected.
         */
        if (senderIsAdmin) {
            console.log(
                `[Anti-Link] Ignored admin link from ${sender}`
            );

            return false;
        }

        /*
         * The bot MUST be a group admin to delete
         * another participant's message.
         */
        if (!botIsAdmin) {
            console.warn(
                `[Anti-Link] Cannot delete link in ${chat}: bot is not an admin.`
            );

            await sock.sendMessage(
                chat,
                {
                    text:
`⚠️ *ANTI-LINK*

A link was detected from @${String(sender).split("@")[0]}.

However, I cannot remove it because I am not a group admin.

Please make JLEY-XMD an admin.`,
                    mentions: [sender]
                }
            );

            return true;
        }

        /*
         * Delete offending message.
         */
        try {
            await sock.sendMessage(
                chat,
                {
                    delete: message.key
                }
            );

            console.log(
                `[Anti-Link] Message deleted successfully: ${message?.key?.id}`
            );

        } catch (deleteError) {
            console.error(
                "[Anti-Link] DELETE FAILED:",
                deleteError?.message || deleteError
            );

            return false;
        }

        /*
         * Warn the sender.
         */
        try {
            await sock.sendMessage(
                chat,
                {
                    text:
`🚫 *ANTI-LINK*

Links are not allowed in this group.

@${String(sender).split("@")[0]}, your message was removed.`,
                    mentions: [sender]
                }
            );

        } catch (warningError) {
            console.error(
                "[Anti-Link] Warning failed:",
                warningError?.message || warningError
            );
        }

        console.log(
            `[Anti-Link] REMOVED LINK from ${sender} in ${chat}`
        );

        /*
         * Prevent the command engine from seeing
         * the offending message.
         */
        return true;

    } catch (error) {
        console.error(
            "[Anti-Link] SYSTEM ERROR:",
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