/*
 * JLEY-XMD Anti-Delete Recovery
 *
 * Compatibility wrapper.
 *
 * The main antidelete plugin owns recovery logic.
 * This file intentionally contains no media buffering,
 * history storage, or duplicate recovery implementation.
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

    const content =
        original.message || {};

    const text =
        content.conversation ||
        content.extendedTextMessage?.text ||
        null;

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

    return ctx.reply(

`🗑️ DELETED MESSAGE #${index}

👤 Sent by: +${sender}
🗑️ Deleted by: +${deletedBy}
🕐 ${time}

⚠️ This recovery helper does not load media into memory.
Use the main Anti-Delete recovery handler for media messages.`

    );

}


function formatNumber(jid) {

    if (!jid) {

        return "Unknown";

    }

    return String(jid)
        .split(":")[0]
        .split("@")[0]
        .trim() || "Unknown";

}