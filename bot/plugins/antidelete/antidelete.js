import {
    isEnabled,
    setEnabled,
    getDeleted,
    getAllDeleted
} from "../../system/antideleteStore.js";

import {
    downloadMediaMessage
} from "@whiskeysockets/baileys";


export default {

    name: "antidelete",

    aliases: [
        "ad"
    ],

    category: "antidelete",

    description:
        "Manage and recover deleted messages",

    usage:
        ".antidelete on/off/all | .antidelete1",

    permissions: {
        botOwner: true
    },


    async execute(ctx) {

        const args =
            Array.isArray(ctx.args)
                ? ctx.args
                : [];


        const first =
            String(
                args[0] || ""
            )
                .trim()
                .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | Enable Automatic Recovery
        |--------------------------------------------------------------------------
        */

        if (first === "on") {

            setEnabled(
                ctx.deploymentId,
                true
            );

            return ctx.reply(
                "🟢 Anti-delete automatic recovery is now enabled.\n\nEvery deleted message will be restored automatically."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Disable Automatic Recovery
        |--------------------------------------------------------------------------
        */

        if (first === "off") {

            setEnabled(
                ctx.deploymentId,
                false
            );

            return ctx.reply(
                "🔴 Anti-delete automatic recovery is now disabled.\n\nDeleted messages will still be saved and can be recovered manually."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Recover All
        |--------------------------------------------------------------------------
        */

        if (first === "all") {

            const deleted =
                getAllDeleted(
                    ctx.deploymentId
                );


            if (!deleted.length) {

                return ctx.reply(
                    "❌ No deleted messages are currently stored."
                );

            }


            for (const item of deleted) {

                await sendDeleted(
                    ctx,
                    item
                );

            }

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | Numbered Recovery
        |--------------------------------------------------------------------------
        |
        | .antidelete1
        | .antidelete2
        | .antidelete3
        |
        | The command handler will route these commands
        | to this plugin.
        |
        */

        const numberedCommand =
            String(
                ctx.command || ""
            )
                .toLowerCase()
                .match(
                    /^antidelete(\d+)$/
                );


        if (numberedCommand) {

            const index =
                Number(
                    numberedCommand[1]
                );


            if (
                !Number.isInteger(index) ||
                index < 1
            ) {

                return ctx.reply(
                    "❌ Invalid anti-delete number."
                );

            }


            const deleted =
                getDeleted(
                    ctx.deploymentId,
                    index
                );


            if (!deleted) {

                return ctx.reply(
                    `❌ Deleted message #${index} was not found.`
                );

            }


            return sendDeleted(
                ctx,
                deleted
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Status / Help
        |--------------------------------------------------------------------------
        */

        const enabled =
            isEnabled(
                ctx.deploymentId
            );


        return ctx.reply(

`🛡️ ANTIDELETE

Status:
${enabled ? "🟢 Automatic recovery enabled" : "🔴 Automatic recovery disabled"}

Commands:

.antidelete on
.antidelete off

.antidelete1
.antidelete2
.antidelete3

.antidelete all

💡 Deleted messages are always stored temporarily.
Automatic recovery only happens when Anti-Delete is enabled.`

        );

    }

};


/*
|--------------------------------------------------------------------------
| Send Deleted Message
|--------------------------------------------------------------------------
*/

async function sendDeleted(
    ctx,
    item
) {

    if (!item) {

        return ctx.reply(
            "❌ Deleted message could not be found."
        );

    }


    const original =
        item.message;


    const sender =
        item.sender ||
        "Unknown";


    const deletedBy =
        item.deletedBy ||
        "Unknown";


    const senderNumber =
        formatNumber(
            sender
        );


    const deletedByNumber =
        formatNumber(
            deletedBy
        );


    const senderName =
        item.senderName ||
        "Unknown";


    const time =
        item.deletedAt
            ? new Date(
                item.deletedAt
            ).toLocaleString()
            : "Unknown";


    const content =
        original?.message ||
        {};


    /*
    |--------------------------------------------------------------------------
    | Text
    |--------------------------------------------------------------------------
    */

    const text =
        content.conversation ||
        content.extendedTextMessage?.text ||
        null;


    if (text) {

        return ctx.reply(

`🗑️ DELETED MESSAGE

👤 Sent by: ${senderName}
📱 Number: +${senderNumber}

🗑️ Deleted by:
+${deletedByNumber}

🕐 Deleted: ${time}

💬 Message:
${text}`

        );

    }


    /*
    |--------------------------------------------------------------------------
    | Image
    |--------------------------------------------------------------------------
    */

    if (content.imageMessage) {

        const buffer =
            await downloadOriginal(
                original
            );


        if (buffer) {

            return ctx.send({

                image:
                    buffer,

                caption:

`🗑️ DELETED IMAGE

👤 Sent by: ${senderName}
📱 Number: +${senderNumber}

🗑️ Deleted by:
+${deletedByNumber}

🕐 Deleted: ${time}

${content.imageMessage.caption || ""}`

            });

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Video
    |--------------------------------------------------------------------------
    */

    if (content.videoMessage) {

        const buffer =
            await downloadOriginal(
                original
            );


        if (buffer) {

            return ctx.send({

                video:
                    buffer,

                caption:

`🗑️ DELETED VIDEO

👤 Sent by: ${senderName}
📱 Number: +${senderNumber}

🗑️ Deleted by:
+${deletedByNumber}

🕐 Deleted: ${time}

${content.videoMessage.caption || ""}`

            });

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Audio
    |--------------------------------------------------------------------------
    */

    if (content.audioMessage) {

        const buffer =
            await downloadOriginal(
                original
            );


        if (buffer) {

            return ctx.send({

                audio:
                    buffer,

                mimetype:
                    content.audioMessage.mimetype ||
                    "audio/mp4",

                ptt:
                    Boolean(
                        content.audioMessage.ptt
                    )

            });

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Document
    |--------------------------------------------------------------------------
    */

    if (content.documentMessage) {

        const buffer =
            await downloadOriginal(
                original
            );


        if (buffer) {

            return ctx.send({

                document:
                    buffer,

                mimetype:
                    content.documentMessage.mimetype ||
                    "application/octet-stream",

                fileName:
                    content.documentMessage.fileName ||
                    "deleted-document"

            });

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Sticker
    |--------------------------------------------------------------------------
    */

    if (content.stickerMessage) {

        const buffer =
            await downloadOriginal(
                original
            );


        if (buffer) {

            return ctx.send({

                sticker:
                    buffer

            });

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Unsupported / Failed Media
    |--------------------------------------------------------------------------
    */

    return ctx.reply(

`🗑️ DELETED MESSAGE

👤 Sent by: ${senderName}
📱 Number: +${senderNumber}

🗑️ Deleted by:
+${deletedByNumber}

🕐 Deleted: ${time}

⚠️ The original media could not be restored.`

    );

}


/*
|--------------------------------------------------------------------------
| Download Original Media
|--------------------------------------------------------------------------
*/

async function downloadOriginal(
    message
) {

    if (!message?.message) {

        return null;

    }


    try {

        return await downloadMediaMessage(

            message,

            "buffer",

            {},

            {
                logger: console
            }

        );

    }

    catch (error) {

        console.error(
            "Anti-delete media download failed:",
            error
        );

        return null;

    }

}


/*
|--------------------------------------------------------------------------
| Format JID / Number
|--------------------------------------------------------------------------
*/

function formatNumber(
    jid
) {

    if (!jid) {

        return "Unknown";

    }


    const value =
        String(jid)
            .split(":")[0]
            .split("@")[0];


    return (
        value ||
        "Unknown"
    );

}