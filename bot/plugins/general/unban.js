import config from "../../config/config.js";

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

function getConfiguredDeveloperJids(config) {
    const candidates = [
        config?.developer?.number,
        config?.developer?.phone,
        config?.developer?.jid,
        config?.developerNumber,
        config?.developerPhone,
        config?.developerJid
    ];

    return candidates
        .filter(Boolean)
        .flatMap(value => {
            const stringValue = String(value).trim();

            if (stringValue.includes("@")) {
                return [normalizeJid(stringValue)];
            }

            const jid = jidFromNumber(stringValue);

            return jid ? [jid] : [];
        });
}

function getConfiguredOwnerJids(config) {
    const candidates = [
        config?.owner?.number,
        config?.owner?.phone,
        config?.owner?.jid
    ];

    return candidates
        .filter(Boolean)
        .flatMap(value => {
            const stringValue = String(value).trim();

            if (stringValue.includes("@")) {
                return [normalizeJid(stringValue)];
            }

            const jid = jidFromNumber(stringValue);

            return jid ? [jid] : [];
        });
}

function isAuthorized(ctx) {
    const sender = normalizeJid(ctx.sender);

    if (!sender) {
        return false;
    }

    const activeConfig = ctx.config || config;

    const developerJids =
        getConfiguredDeveloperJids(activeConfig);

    if (
        developerJids.some(
            jid => normalizeJid(jid) === sender
        )
    ) {
        return true;
    }

    const ownerJids =
        getConfiguredOwnerJids(activeConfig);

    if (
        ownerJids.some(
            jid => normalizeJid(jid) === sender
        )
    ) {
        return true;
    }

    if (ctx.isBotOwner === true) {
        return true;
    }

    if (ctx.botOwner === true) {
        return true;
    }

    return false;
}

function getTarget(ctx) {
    if (ctx.target && ctx.target !== ctx.sender) {
        return normalizeJid(ctx.target);
    }

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
    name: "uban",

    aliases: [
        "unblock"
    ],

    category: "general",

    description:
        "Unblock a WhatsApp user. Restricted to the bot owner and developer.",

    usage:
        ".uban @user | reply to a message | .uban 2547XXXXXXXX",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        if (!isAuthorized(ctx)) {
            return ctx.reply(
                "❌ This command is restricted to the bot owner and JLEY-XMD developer."
            );
        }

        const target = getTarget(ctx);

        if (!target) {
            return ctx.reply(
                "❌ Please reply to a user's message, mention them, or provide their WhatsApp number.\n\n" +
                `Example: ${ctx.prefix}uban @2547XXXXXXXX\n` +
                `Example: ${ctx.prefix}uban 2547XXXXXXXX`
            );
        }

        const botJids = [
            ctx.client?.user?.id,
            ctx.client?.user?.lid
        ]
            .filter(Boolean)
            .map(normalizeJid);

        if (botJids.includes(normalizeJid(target))) {
            return ctx.reply(
                "❌ I cannot unblock the bot's own account."
            );
        }

        if (
            normalizeJid(target) ===
            normalizeJid(ctx.sender)
        ) {
            return ctx.reply(
                "❌ You cannot unblock yourself."
            );
        }

        try {
            await ctx.client.updateBlockStatus(
                target,
                "unblock"
            );

            return ctx.reply(
                `╭━━━〔 🔓 USER UNBLOCKED 〕━━━╮\n\n` +
                `👤 User\n` +
                `${target}\n\n` +
                `🔓 Status\n` +
                `Unblocked successfully.\n\n` +
                `🛡️ Authorized by\n` +
                `Bot Owner / Developer\n\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );

        } catch (error) {
            console.error(
                "[UBAN] Failed to unblock user:",
                error
            );

            return ctx.reply(
                `❌ Failed to unblock ${target}.\n\n` +
                `Reason: ${error?.message || "Unknown error"}`
            );
        }
    }
};