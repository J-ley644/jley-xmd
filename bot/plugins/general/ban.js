export default {

    name: "ban",

    aliases: [
        "block"
    ],

    category: "general",

    description:
        "Block a WhatsApp user. Restricted to the bot owner and JLEY-XMD developer.",

    usage:
        ".ban @user | reply to a message | .ban 2547XXXXXXXX",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        const target =
            ctx.target && ctx.target !== ctx.sender
                ? ctx.target
                : ctx.args?.[0]
                    ? (
                        ctx.args[0].startsWith("@")
                            ? ctx.args[0].slice(1)
                            : ctx.args[0]
                    )
                    : null;

        if (!target) {

            return ctx.reply(
                "❌ Please reply to a user's message, mention them, or provide their WhatsApp number.\n\n" +
                `Example: ${ctx.prefix}ban @2547XXXXXXXX\n` +
                `Example: ${ctx.prefix}ban 2547XXXXXXXX`
            );

        }

        let targetJid = target;

        if (!targetJid.includes("@")) {

            const number =
                String(targetJid)
                    .replace(/\D/g, "");

            if (!number) {

                return ctx.reply(
                    "❌ Invalid WhatsApp number."
                );

            }

            targetJid =
                `${number}@s.whatsapp.net`;

        }

        const botJids = [
            ctx.client?.user?.id,
            ctx.client?.user?.lid
        ]
            .filter(Boolean);

        if (
            botJids.includes(targetJid)
        ) {

            return ctx.reply(
                "❌ I cannot block this bot's own account."
            );

        }

        if (
            targetJid === ctx.sender
        ) {

            return ctx.reply(
                "❌ You cannot block yourself."
            );

        }

        try {

            await ctx.client.updateBlockStatus(
                targetJid,
                "block"
            );

            return ctx.reply(
                `╭━━━〔 🚫 USER BLOCKED 〕━━━╮\n\n` +
                `👤 User\n` +
                `${targetJid}\n\n` +
                `🔒 Status\n` +
                `Blocked successfully.\n\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯`
            );

        } catch (error) {

            console.error(
                "[BAN] Failed to block user:",
                error
            );

            return ctx.reply(
                `❌ Failed to block ${targetJid}.\n\n` +
                `Reason: ${error?.message || "Unknown error"}`
            );

        }

    }

};