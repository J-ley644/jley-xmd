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

        /*
         * Deployment ID is the stable identity for
         * this particular bot deployment.
         *
         * We keep the WhatsApp identities as a
         * fallback for older deployments/settings.
         */

        const deploymentId =
            ctx.client?.deploymentId ||
            null;

        const botIdentities = [
            ctx.client?.user?.lid,
            ctx.client?.user?.id
        ].filter(Boolean);


        /*
         * We need at least one usable identity.
         */

        if (
            !deploymentId &&
            botIdentities.length === 0
        ) {

            return ctx.reply(
                "❌ Unable to identify this bot account."
            );

        }


        /*
         * Determine which command was used.
         */

        const command =
            String(ctx.command || "mode")
                .trim()
                .toLowerCase();


        /*
         * Helper used to save mode.
         *
         * New deployments use deploymentId.
         *
         * Older deployments without deploymentId
         * continue using their WhatsApp identity.
         */

        const saveMode = (mode) => {

            if (deploymentId) {

                automationStore.set(
                    deploymentId,
                    "mode",
                    mode
                );

                return;

            }


            const identity =
                botIdentities[0];

            automationStore.set(
                identity,
                "mode",
                mode
            );

        };


        /*
         * Helper used to read mode.
         */

        const getCurrentMode = () => {

            /*
             * New stable storage.
             */

            if (deploymentId) {

                const deploymentMode =
                    automationStore.getValue(
                        deploymentId,
                        "mode"
                    );

                if (deploymentMode) {

                    return deploymentMode;

                }

            }


            /*
             * Backward compatibility:
             * check existing WhatsApp identities.
             */

            for (
                const identity
                of botIdentities
            ) {

                const savedMode =
                    automationStore.getValue(
                        identity,
                        "mode"
                    );

                if (savedMode) {

                    return savedMode;

                }

            }


            return "public";

        };


        /*
         * .modeprivate
         */

        if (
            command === "modeprivate"
        ) {

            saveMode("private");

            return ctx.reply(
                "🔒 Bot mode is now *PRIVATE*.\n\nOnly the bot owner can use commands."
            );

        }


        /*
         * .modepublic
         */

        if (
            command === "modepublic"
        ) {

            saveMode("public");

            return ctx.reply(
                "🌐 Bot mode is now *PUBLIC*.\n\nEveryone can use commands."
            );

        }


        /*
         * .mode private
         */

        const option =
            String(ctx.args?.[0] || "")
                .trim()
                .toLowerCase();


        if (
            option === "private"
        ) {

            saveMode("private");

            return ctx.reply(
                "🔒 Bot mode is now *PRIVATE*.\n\nOnly the bot owner can use commands."
            );

        }


        /*
         * .mode public
         */

        if (
            option === "public"
        ) {

            saveMode("public");

            return ctx.reply(
                "🌐 Bot mode is now *PUBLIC*.\n\nEveryone can use commands."
            );

        }


        /*
         * Show current mode.
         */

        const currentMode =
            getCurrentMode();


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