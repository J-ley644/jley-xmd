import { handleCommand } from "../../../bot/core/commandHandler.js";
import loadPlugins from "../../../bot/core/pluginLoader.js";
import config from "../../../bot/config/config.js";
import automationStore from "../../../bot/system/automationStore.js";
import relationshipTracker from "../../../bot/system/relationshipTracker.js";

import {
    isEnabled,
    storeMessage,
    markDeleted
} from "../../../bot/system/antideleteStore.js";


let pluginsLoaded = false;


/*
|--------------------------------------------------------------------------
| Anti-Delete Listener Registry
|--------------------------------------------------------------------------
*/

const antiDeleteSockets = new WeakSet();


/*
|--------------------------------------------------------------------------
| Ensure Plugins
|--------------------------------------------------------------------------
*/

async function ensurePluginsLoaded() {

    if (pluginsLoaded) {
        return;
    }

    await loadPlugins();

    pluginsLoaded = true;

    console.log(
        "JLEY-XMD advanced plugins loaded."
    );

}


/*
|--------------------------------------------------------------------------
| Automation Identity
|--------------------------------------------------------------------------
*/

function getBotIdentity(sock) {

    return (
        sock?.user?.lid ||
        sock?.user?.id ||
        null
    );

}


/*
|--------------------------------------------------------------------------
| Message Text
|--------------------------------------------------------------------------
*/

function getMessageText(message) {

    return (
        message?.message?.conversation ||
        message?.message?.extendedTextMessage?.text ||
        message?.message?.imageMessage?.caption ||
        message?.message?.videoMessage?.caption ||
        ""
    );

}


/*
|--------------------------------------------------------------------------
| Anti-Delete Recovery
|--------------------------------------------------------------------------
*/

async function recoverDeletedMessage(
    sock,
    deleted
) {

    if (!deleted?.message) {
        return;
    }

    const chat =
        deleted.chat;

    if (!chat) {
        return;
    }

    const original =
        deleted.message;

    const sender =
        deleted.sender ||
        deleted.key?.participant ||
        deleted.key?.remoteJid ||
        "Unknown";

    const deletedBy =
        deleted.deletedBy ||
        "Unknown";

    const time =
        deleted.deletedAt
            ? new Date(
                deleted.deletedAt
            ).toLocaleString()
            : new Date().toLocaleString();

    const text =
        original.conversation ||
        original.extendedTextMessage?.text ||
        original.imageMessage?.caption ||
        original.videoMessage?.caption ||
        "";

    try {

        /*
         * Text message
         */

        if (text) {

            await sock.sendMessage(
                chat,
                {
                    text:
`🗑️ *ANTI-DELETE*

👤 Sent by: +${formatNumber(sender)}

🗑️ Deleted by: +${formatNumber(deletedBy)}

🕐 ${time}

💬 *Deleted Message:*

${text}`
                }
            );

            return;

        }


        /*
         * Image
         */

        if (original.imageMessage) {

            await sock.sendMessage(
                chat,
                {
                    image:
                        original.imageMessage,
                    caption:
`🗑️ *ANTI-DELETE*

👤 Sent by: +${formatNumber(sender)}

🗑️ Deleted by: +${formatNumber(deletedBy)}

🕐 ${time}

📷 Deleted image recovered.`
                }
            );

            return;

        }


        /*
         * Video
         */

        if (original.videoMessage) {

            await sock.sendMessage(
                chat,
                {
                    video:
                        original.videoMessage,
                    caption:
`🗑️ *ANTI-DELETE*

👤 Sent by: +${formatNumber(sender)}

🗑️ Deleted by: +${formatNumber(deletedBy)}

🕐 ${time}

🎥 Deleted video recovered.`
                }
            );

            return;

        }


        /*
         * Audio
         */

        if (original.audioMessage) {

            await sock.sendMessage(
                chat,
                {
                    audio:
                        original.audioMessage,
                    mimetype:
                        original.audioMessage.mimetype ||
                        "audio/mp4"
                }
            );

            await sock.sendMessage(
                chat,
                {
                    text:
`🗑️ *ANTI-DELETE*

👤 Sent by: +${formatNumber(sender)}

🗑️ Deleted by: +${formatNumber(deletedBy)}

🕐 ${time}

🎵 Deleted audio recovered.`
                }
            );

            return;

        }


        /*
         * Sticker
         */

        if (original.stickerMessage) {

            await sock.sendMessage(
                chat,
                {
                    sticker:
                        original.stickerMessage
                }
            );

            return;

        }


        /*
         * Document
         */

        if (original.documentMessage) {

            await sock.sendMessage(
                chat,
                {
                    document:
                        original.documentMessage,
                    mimetype:
                        original.documentMessage.mimetype ||
                        "application/octet-stream",
                    fileName:
                        original.documentMessage.fileName ||
                        "deleted-file"
                }
            );

            return;

        }


        /*
         * Fallback
         */

        await sock.sendMessage(
            chat,
            {
                text:
`🗑️ *ANTI-DELETE*

👤 Sent by: +${formatNumber(sender)}

🗑️ Deleted by: +${formatNumber(deletedBy)}

🕐 ${time}

⚠️ A deleted message was detected, but its content could not be reconstructed.`
            }
        );

    } catch (error) {

        console.error(
            "Anti-Delete recovery error:",
            error?.message ||
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| Deleted Message Handler
|--------------------------------------------------------------------------
*/

async function handleDeletedMessage(
    sock,
    update
) {

    try {

        if (!update) {
            return;
        }


        const key =
            update.key ||
            update.update?.key;


        /*
         * Different Baileys versions expose
         * revoke events differently.
         */

        const message =
            update.update?.message ||
            update.message;


        const protocol =
            message?.protocolMessage;


        const stubType =
            update.update?.messageStubType ||
            update.messageStubType;


        const isProtocolRevoke =
            protocol?.type === 0 ||
            protocol?.type === "REVOKE" ||
            String(protocol?.type || "")
                .toUpperCase()
                .includes("REVOKE");


        const isStubRevoke =
            String(stubType || "")
                .toUpperCase()
                .includes("REVOKE");


        if (
            !isProtocolRevoke &&
            !isStubRevoke
        ) {
            return;
        }


        const messageKey =
            protocol?.key ||
            update.update?.key ||
            update.key;


        const messageId =
            messageKey?.id ||
            key?.id;


        if (!messageId) {
            return;
        }


        const deploymentId =
            sock?.deploymentId ||
            "main";


        /*
         * Only process Anti-Delete when enabled.
         */

        if (
            !isEnabled(
                deploymentId
            )
        ) {
            return;
        }


        const deletedBy =
            update.update?.participant ||
            update.participant ||
            sock?.user?.id ||
            "Unknown";


        const recovered =
            markDeleted(
                deploymentId,
                messageId,
                deletedBy
            );


        if (!recovered) {

            console.log(
                `[Anti-Delete] Message ${messageId} was deleted but was not found in history.`
            );

            return;

        }


        console.log(
            `[Anti-Delete] Recovering deleted message ${messageId}`
        );


        await recoverDeletedMessage(
            sock,
            recovered
        );

    } catch (error) {

        console.error(
            "Anti-Delete detection error:",
            error?.message ||
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| Install Anti-Delete Listener
|--------------------------------------------------------------------------
*/

function ensureAntiDeleteListener(
    sock
) {

    if (!sock?.ev) {
        return;
    }


    /*
     * Prevent duplicate listeners
     * on the same socket.
     */

    if (
        antiDeleteSockets.has(sock)
    ) {
        return;
    }


    antiDeleteSockets.add(sock);


    sock.ev.on(
        "messages.update",
        async updates => {

            if (!Array.isArray(updates)) {
                return;
            }


            for (
                const update of updates
            ) {

                try {

                    await handleDeletedMessage(
                        sock,
                        update
                    );

                } catch (error) {

                    console.error(
                        "Anti-Delete update error:",
                        error?.message ||
                        error
                    );

                }

            }

        }
    );


    console.log(
        "[Anti-Delete] Message deletion listener attached."
    );

}


/*
|--------------------------------------------------------------------------
| Store Incoming Message
|--------------------------------------------------------------------------
*/

function captureMessageForAntiDelete(
    sock,
    message
) {

    try {

        const deploymentId =
            sock?.deploymentId ||
            "main";


        if (
            !isEnabled(
                deploymentId
            )
        ) {
            return;
        }


        if (
            !message?.key?.id ||
            !message?.message
        ) {
            return;
        }


        const chat =
            message.key.remoteJid;


        if (!chat) {
            return;
        }


        /*
         * Don't store status broadcasts.
         */

        if (
            chat ===
            "status@broadcast"
        ) {
            return;
        }


        storeMessage(
            deploymentId,
            {
                id:
                    message.key.id,

                chat,

                sender:
                    message.key.participant ||
                    message.key.remoteJid,

                senderName:
                    message.pushName ||
                    "Unknown",

                key:
                    message.key,

                message:
                    message.message,

                timestamp:
                    message.messageTimestamp
                        ? Number(
                            message.messageTimestamp
                        ) * 1000
                        : Date.now()
            }
        );

    } catch (error) {

        console.error(
            "Anti-Delete message capture error:",
            error?.message ||
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| AutoTyping
|--------------------------------------------------------------------------
*/

async function handleAutoTyping(
    sock,
    message,
    jid
) {

    if (
        !sock ||
        !message ||
        !jid
    ) {
        return;
    }


    if (
        jid === "status@broadcast" ||
        jid.endsWith(
            "status@broadcast"
        )
    ) {
        return;
    }


    const botIdentity =
        getBotIdentity(sock);


    if (!botIdentity) {
        return;
    }


    const settings =
        automationStore.get(
            botIdentity
        );


    let recordingEnabled =
        settings?.autorecording === true;


    const chatSettings =
        settings?.chats?.[jid];


    if (
        chatSettings &&
        Object.prototype.hasOwnProperty.call(
            chatSettings,
            "autorecording"
        )
    ) {

        recordingEnabled =
            chatSettings.autorecording === true;

    }


    if (recordingEnabled) {
        return;
    }


    let enabled =
        settings?.autotyping === true;


    if (
        chatSettings &&
        Object.prototype.hasOwnProperty.call(
            chatSettings,
            "autotyping"
        )
    ) {

        enabled =
            chatSettings.autotyping === true;

    }


    if (!enabled) {
        return;
    }


    try {

        await sock.sendPresenceUpdate(
            "composing",
            jid
        );


        const typingInterval =
            setInterval(
                async () => {

                    try {

                        await sock.sendPresenceUpdate(
                            "composing",
                            jid
                        );

                    } catch {}

                },
                3000
            );


        setTimeout(
            async () => {

                clearInterval(
                    typingInterval
                );

                try {

                    await sock.sendPresenceUpdate(
                        "paused",
                        jid
                    );

                } catch {}

            },
            10000
        );

    } catch (error) {

        console.error(
            "AutoTyping error:",
            error?.message ||
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| AutoRecording
|--------------------------------------------------------------------------
*/

async function handleAutoRecording(
    sock,
    message,
    jid
) {

    if (
        !sock ||
        !message ||
        !jid
    ) {
        return;
    }


    if (
        jid === "status@broadcast" ||
        jid.endsWith(
            "status@broadcast"
        )
    ) {
        return;
    }


    const botIdentity =
        getBotIdentity(sock);


    if (!botIdentity) {
        return;
    }


    const settings =
        automationStore.get(
            botIdentity
        );


    let enabled =
        settings?.autorecording === true;


    const chatSettings =
        settings?.chats?.[jid];


    if (
        chatSettings &&
        Object.prototype.hasOwnProperty.call(
            chatSettings,
            "autorecording"
        )
    ) {

        enabled =
            chatSettings.autorecording === true;

    }


    if (!enabled) {
        return;
    }


    try {

        console.log(
            "[AutoRecording] Recording:",
            jid
        );


        await sock.sendPresenceUpdate(
            "recording",
            jid
        );


        const recordingInterval =
            setInterval(
                async () => {

                    try {

                        await sock.sendPresenceUpdate(
                            "recording",
                            jid
                        );

                    } catch {}

                },
                3000
            );


        setTimeout(
            async () => {

                clearInterval(
                    recordingInterval
                );

                try {

                    await sock.sendPresenceUpdate(
                        "paused",
                        jid
                    );

                } catch {}

            },
            10000
        );

    } catch (error) {

        console.error(
            "AutoRecording error:",
            error?.message ||
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| Relationship Tracking
|--------------------------------------------------------------------------
*/

function trackRelationship(
    sock,
    message
) {

    try {

        relationshipTracker.trackMessage(
            sock,
            message
        );

    } catch (error) {

        console.error(
            "Relationship tracking error:",
            error?.message ||
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| Message Handler
|--------------------------------------------------------------------------
*/

export async function handleMessage(
    sock,
    message
) {

    /*
     * Install the deletion listener as soon
     * as this socket receives its first message.
     */

    ensureAntiDeleteListener(
        sock
    );


    /*
     * Capture messages BEFORE command/text
     * filtering.
     */

    captureMessageForAntiDelete(
        sock,
        message
    );


    if (!message?.message) {
        return;
    }


    const jid =
        message.key?.remoteJid;


    if (!jid) {
        return;
    }


    const text =
        getMessageText(
            message
        );


    /*
     * Relationship tracking should still
     * receive normal text messages.
     */

    if (
        text.trim()
    ) {

        trackRelationship(
            sock,
            message
        );

    }


    /*
     * Auto Recording
     */

    void handleAutoRecording(
        sock,
        message,
        jid
    );


    /*
     * Auto Typing
     */

    void handleAutoTyping(
        sock,
        message,
        jid
    );


    /*
     * Empty message.
     */

    if (!text.trim()) {
        return;
    }


    /*
     * Ignore own non-command messages.
     */

    if (
        message.key?.fromMe &&
        !text
            .trim()
            .startsWith(
                config.prefix
            )
    ) {

        return;

    }


    try {

        await ensurePluginsLoaded();


        await handleCommand(
            sock,
            message
        );

    } catch (error) {

        console.error(
            "Advanced message engine error:",
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| Number Formatter
|--------------------------------------------------------------------------
*/

function formatNumber(
    jid
) {

    if (!jid) {
        return "Unknown";
    }


    return String(jid)
        .split(":")[0]
        .split("@")[0]
        .trim() ||
        "Unknown";

}