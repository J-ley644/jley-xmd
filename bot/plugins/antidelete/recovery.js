/*
 * JLEY-XMD Anti-Delete Recovery
 *
 * Recovery helper for deleted messages.
 */

export async function recoverDeleted(
    ctx,
    item,
    index = 1
) {

    if (!item) {

        return ctx.reply(
            `❌ Deleted message #${index} is unavailable.`
        );

    }


    const original =
        item.message;


    if (!original) {

        return ctx.reply(
            `❌ Deleted message #${index} is unavailable.`
        );

    }


    const text =
        original.conversation ||
        original.extendedTextMessage?.text ||
        original.imageMessage?.caption ||
        original.videoMessage?.caption ||
        "";


    const sender =
        formatNumber(
            item.sender
        );


    const deletedBy =
        formatNumber(
            item.deletedBy
        );


    const time =
        item.deletedAt
            ? new Date(
                item.deletedAt
            ).toLocaleString()
            : "Unknown";


    /*
     * Text
     */

    if (text) {

        return ctx.reply(
`🗑️ DELETED MESSAGE #${index}

👤 Sent by: +${sender}

🗑️ Deleted by: +${deletedBy}

🕐 ${time}

💬 Message:
${text}`
        );

    }


    /*
     * Media
     */

    let mediaType =
        "media";


    if (original.imageMessage) {
        mediaType = "image";
    }

    else if (
        original.videoMessage
    ) {
        mediaType = "video";
    }

    else if (
        original.audioMessage
    ) {
        mediaType = "audio";
    }

    else if (
        original.stickerMessage
    ) {
        mediaType = "sticker";
    }

    else if (
        original.documentMessage
    ) {
        mediaType = "document";
    }


    return ctx.reply(
`🗑️ DELETED MESSAGE #${index}

👤 Sent by: +${sender}

🗑️ Deleted by: +${deletedBy}

🕐 ${time}

📦 Type: ${mediaType}

⚠️ The deleted media was detected and stored, but this manual recovery helper only displays its metadata.`
    );

}


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