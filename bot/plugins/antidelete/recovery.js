import { downloadMediaMessage } from "@whiskeysockets/baileys";


export async function recoverDeleted(
    ctx,
    item,
    index
) {

    const original =
        item?.message;

    if (!original) {

        return ctx.reply(
            `? Deleted message #${index} is unavailable.`
        );

    }

    const sender =
        item.sender || "Unknown";

    const deletedBy =
        item.deletedBy || "Unknown";

    const senderNumber =
        sender.split(":")[0].split("@")[0];

    const deletedByNumber =
        deletedBy.split(":")[0].split("@")[0];

    const time =
        item.deletedAt
            ? new Date(item.deletedAt).toLocaleString()
            : "Unknown";

    const content =
        original.message || {};

    const text =
        content.conversation ||
        content.extendedTextMessage?.text ||
        null;


    if (text) {

        return ctx.reply(

`??? DELETED MESSAGE #${index}

?? Sent by: +${senderNumber}
??? Deleted by: +${deletedByNumber}
?? ${time}

?? Message:
${text}`

        );

    }


    let buffer = null;

    try {

        buffer =
            await downloadMediaMessage(
                original,
                "buffer",
                {},
                {
                    logger: console
                }
            );

    } catch {

        buffer = null;

    }


    if (
        buffer &&
        content.imageMessage
    ) {

        return ctx.send({

            image: buffer,

            caption:

`??? DELETED IMAGE #${index}

?? Sent by: +${senderNumber}
??? Deleted by: +${deletedByNumber}
?? ${time}`

        });

    }


    if (
        buffer &&
        content.videoMessage
    ) {

        return ctx.send({

            video: buffer,

            caption:

`??? DELETED VIDEO #${index}

?? Sent by: +${senderNumber}
??? Deleted by: +${deletedByNumber}
?? ${time}`

        });

    }


    if (
        buffer &&
        content.audioMessage
    ) {

        return ctx.send({

            audio: buffer,

            mimetype:
                content.audioMessage.mimetype ||
                "audio/mp4"

        });

    }


    return ctx.reply(

`??? DELETED MESSAGE #${index}

?? Sent by: +${senderNumber}
??? Deleted by: +${deletedByNumber}
?? ${time}

?? The original message could not be restored.`

    );

}
