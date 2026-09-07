function normalizeJid(jid) {
    if (!jid) return null;

    return String(jid)
        .trim()
        .replace(/:\d+@/, "@");
}

function normalizeNumber(value) {
    return String(value || "").replace(/\D/g, "");
}

function jidFromNumber(value) {
    const number = normalizeNumber(value);

    if (!number) {
        return null;
    }

    return `${number}@s.whatsapp.net`;
}

function getTarget(ctx) {
    // Mentioned/replied target from context
    if (ctx.target && ctx.target !== ctx.sender) {
        return normalizeJid(ctx.target);
    }

    // Number supplied as argument
    const argument = ctx.args?.[0];

    if (argument) {
        const target = argument.startsWith("@")
            ? argument.slice(1)
            : argument;

        const jid = jidFromNumber(target);

        if (jid) {
            return jid;
        }
    }

    // Quoted message participant
    const quotedParticipant =
        ctx.message
            ?.message
            ?.extendedTextMessage
            ?.contextInfo
            ?.participant;

    if (quotedParticipant) {
        return normalizeJid(quotedParticipant);
    }

    return null;
}

export default {
    name: "unban",

    aliases: [
        "unblock"
    ],

    category: "general",

    description:
        "Unblock a WhatsApp user. Restricted to the bot owner and developer.",

    usage:
        ".unban @user | reply to a message | .unban 2547XXXXXXXX",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {
        const target = getTarget(ctx);

        if (!target) {
            return ctx.reply(
                "❌ Please reply to a user's message, mention them, or provide their WhatsApp number.\n\n" +
                `Example: ${ctx.prefix}unban @2547XXXXXXXX\n` +
                `Example: ${ctx.prefix}unban 2547XXXXXXXX`
            );
        }

        const normalizedTarget = normalizeJid(target);

        const botJids = [
            ctx.client?.user?.id,
            ctx.client?.user?.lid
        ]
            .filter(Boolean)
            .map(normalizeJid);

        if (botJids.includes(normalizedTarget)) {
            return ctx.reply(
                "❌ I cannot unblock the bot's own account."
            );
        }

        if (
            normalizedTarget ===
            normalizeJid(ctx.sender)
        ) {
            return ctx.reply(
                "❌ You cannot unblock yourself."
            );
        }

        try {
            await ctx.client.updateBlockStatus(
                normalizedTarget,
                "unblock"
            );

            return ctx.reply(
                `╭━━━〔 🔓 USER UNBLOCKED 〕━━━╮\n\n` +
                `👤 User\n` +
                `${normalizedTarget}\n\n` +
                `🔓 Status\n` +
                `Unblocked successfully.\n\n` +
                `🛡️ Authorized by\n` +
                `Bot Owner / Developer\n\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );

        } catch (error) {
            console.error(
                "[UNBAN] Failed to unblock user:",
                error
            );

            return ctx.reply(
                `❌ Failed to unblock ${normalizedTarget}.\n\n` +
                `Reason: ${error?.message || "Unknown error"}`
            );
        }
    }
};