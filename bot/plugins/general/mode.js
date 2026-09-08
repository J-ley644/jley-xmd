import automationStore from "../../system/automationStore.js";

export default {
    name: "mode",

    aliases: [
        "modeprivate",
        "modepublic"
    ],

    category: "general",

    description:
        "Control whether the bot is private or public",

    usage:
        ".mode private | .mode public",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        const botIdentity =
            ctx.client?.user?.lid ||
            ctx.client?.user?.id ||
            ctx.botIdentity ||
            null;

        if (!botIdentity) {
            return ctx.reply(
                "❌ Unable to identify this bot account."
            );
        }

        const command =
            String(ctx.command || "mode")
                .trim()
                .toLowerCase();

        /*
         * .modeprivate
         */
        if (command === "modeprivate") {

            automationStore.set(
                botIdentity,
                "mode",
                "private"
            );

            return ctx.reply(
                "🔒 Bot mode is now *PRIVATE*.\n\nOnly the bot owner can use commands."
            );
        }

        /*
         * .modepublic
         */
        if (command === "modepublic") {

            automationStore.set(
                botIdentity,
                "mode",
                "public"
            );

            return ctx.reply(
                "🌐 Bot mode is now *PUBLIC*.\n\nEveryone can use commands."
            );
        }

        /*
         * .mode private / .mode public
         */
        const option =
            String(ctx.args?.[0] || "")
                .trim()
                .toLowerCase();

        if (option === "private") {

            automationStore.set(
                botIdentity,
                "mode",
                "private"
            );

            return ctx.reply(
                "🔒 Bot mode is now *PRIVATE*.\n\nOnly the bot owner can use commands."
            );
        }

        if (option === "public") {

            automationStore.set(
                botIdentity,
                "mode",
                "public"
            );

            return ctx.reply(
                "🌐 Bot mode is now *PUBLIC*.\n\nEveryone can use commands."
            );
        }

        /*
         * Show current mode
         */
        const currentMode =
            automationStore.getValue(
                botIdentity,
                "mode"
            ) || "public";

        return ctx.reply(
            `╭━━━〔 🤖 BOT MODE 〕━━━╮

Current mode:
${currentMode === "private"
    ? "🔒 PRIVATE"
    : "🌐 PUBLIC"}

Usage:
.mode private
.mode public
.modeprivate
.modepublic

╰━━━━━━━━━━━━━━━━━━━━━━╯`
        );
    }
};