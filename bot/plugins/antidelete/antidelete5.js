import {
    getDeleted
} from "../../system/antideleteStore.js";

import {
    downloadMediaMessage
} from "@whiskeysockets/baileys";


export default {

    name: "antidelete5",

    aliases: [],

    category: "antidelete",

    description:
        "Recover the latest deleted message.",

    usage:
        ".antidelete5",

    permissions: {
        botOwner: true
    },


    async execute(ctx) {

        const deleted =
            getDeleted(
                ctx.deploymentId,
                1
            );


        if (!deleted) {

            return ctx.reply(
                "❌ No deleted message #1 is currently stored."
            );

        }


        return sendDeleted(
            ctx,
            deleted,
            1
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
    item,
    index
) {

    const original =
        item.message;


    if (!original?.message) {

        return ctx.reply(
            `❌ Deleted message #${index} is unavailable.`
        );

    }


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
        original.message;


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

`🗑️ DELETED MESSAGE #${index}

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

`🗑️ DELETED IMAGE #${index}

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

`🗑️ DELETED VIDEO #${index}

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
    | Unsupported
    |--------------------------------------------------------------------------
    */

    return ctx.reply(

`🗑️ DELETED MESSAGE #${index}

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