import config from "../../config/config.js";

function normalizeJid(jid) {
    if (!jid) return null;

    return String(jid)
        .trim()
        .replace(/:\d+@/, "@");
}

function normalizeNumber(value) {
    return String(value || "")
        .replace(/\D/g, "");
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

    /*
    |--------------------------------------------------
    | JLEY-XMD Developer
    |--------------------------------------------------
    */

    const developerJids =
        getConfiguredDeveloperJids(ctx.config || config);

    if (
        developerJids.some(
            jid => normalizeJid(jid) === sender
        )
    ) {
        return true;
    }

    /*
    |--------------------------------------------------
    | Deployment Owner
    |--------------------------------------------------
    */

    const ownerJids =
        getConfiguredOwnerJids(ctx.config || config);

    if (
        ownerJids.some(
            jid => normalizeJid(jid) === sender
        )
    ) {
        return true;
    }

    /*
    |--------------------------------------------------
    | Existing permission flag
    |
    | If the core permission system already resolved
    | the sender as the deployment owner, allow it.
    |--------------------------------------------------
    */

    if (ctx.isBotOwner === true) {
        return true;
    }

    if (ctx.botOwner === true) {
        return true;
    }

    return false;
}

function getTarget(ctx) {

    /*
    |--------------------------------------------------
    | Existing context target
    |--------------------------------------------------
    */

    if (ctx.target && ctx.target !== ctx.sender) {
        return normalizeJid(ctx.target);
    }

    /*
    |--------------------------------------------------
    | First argument
    |--------------------------------------------------
    */

    const argument = ctx.args?.[0];

    if (argument) {

        const target =
            argument.startsWith("@")
                ? argument.slice(1)
                : argument;

        const jid = jidFromNumber(target);

        if (jid) {
            return jid;
        }
    }

    /*
    |--------------------------------------------------
    | Reply target
    |--------------------------------------------------
    */

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

    name: "ban",

    aliases: [
        "block"
    ],

    category: "general",

    description:
        "Block a WhatsApp user. Restricted to the bot owner and developer.",

    usage:
        ".ban @user | reply to a message | .ban 2547XXXXXXXX",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        /*
        |--------------------------------------------------
        | Strict Authorization
        |--------------------------------------------------
        */

        if (!isAuthorized(ctx)) {

            return ctx.reply(
                "❌ This command is restricted to the bot owner and JLEY-XMD developer."
            );

        }

        /*
        |--------------------------------------------------
        | Target
        |--------------------------------------------------
        */

        const target = getTarget(ctx);

        if (!target) {

            return ctx.reply(
                "❌ Please reply to a user's message, mention them, or provide their WhatsApp number.\n\n" +
                `Example: ${ctx.prefix}ban @2547XXXXXXXX\n` +
                `Example: ${ctx.prefix}ban 2547XXXXXXXX`
            );

        }

        /*
        |--------------------------------------------------
        | Never block the bot itself
        |--------------------------------------------------
        */

        const botJids = [
            ctx.client?.user?.id,
            ctx.client?.user?.lid
        ]
            .filter(Boolean)
            .map(normalizeJid);

        if (
            botJids.includes(normalizeJid(target))
        ) {

            return ctx.reply(
                "❌ I cannot block this bot's own account."
            );

        }

        /*
        |--------------------------------------------------
        | Never block the command sender
        |--------------------------------------------------
        */

        if (
            normalizeJid(target) ===
            normalizeJid(ctx.sender)
        ) {

            return ctx.reply(
                "❌ You cannot block yourself."
            );

        }

        /*
        |--------------------------------------------------
        | Block user
        |--------------------------------------------------
        */

        try {

            await ctx.client.updateBlockStatus(
                target,
                "block"
            );

            return ctx.reply(
                `╭━━━〔 🚫 USER BLOCKED 〕━━━╮\n\n` +
                `👤 User\n` +
                `${target}\n\n` +
                `🔒 Status\n` +
                `Blocked successfully.\n\n` +
                `🛡️ Authorized by\n` +
                `Bot Owner / Developer\n\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );

        } catch (error) {

            console.error(
                "[BAN] Failed to block user:",
                error
            );

            return ctx.reply(
                `❌ Failed to block ${target}.\n\n` +
                `Reason: ${error?.message || "Unknown error"}`
            );

        }

    }

};