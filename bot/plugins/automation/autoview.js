import automationStore from "../../system/automationStore.js";

export default {

    name: "autoview",

    aliases: [
        "viewstatus"
    ],

    category: "automation",

    description:
        "Automatically view WhatsApp status updates",

    usage:
        ".autoview <on|off>",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        const option =
            String(ctx.args?.[0] || "")
                .trim()
                .toLowerCase();


        /*
         * The setting belongs to the bot deployment,
         * not to the person sending the command.
         *
         * The status engine reads the setting using
         * the connected bot identity.
         */
        const botIdentity =
            ctx.client?.user?.lid ||
            ctx.client?.user?.id ||
            ctx.botJid ||
            ctx.botId;


        if (!botIdentity) {

            return ctx.reply(
                "❌ Unable to identify this bot account."
            );

        }


        if (!["on", "off"].includes(option)) {

            const settings =
                automationStore.get(
                    botIdentity
                );

            return ctx.reply(

`╭━━━〔 👁️ AUTO VIEW 〕━━━╮

Usage

.autoview on
.autoview off

━━━━━━━━━━━━━━━━━━

Current:
${settings.autoview
    ? "🟢 Enabled"
    : "🔴 Disabled"}

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        const enabled =
            option === "on";


        automationStore.set(

            botIdentity,

            "autoview",

            enabled

        );


        return ctx.reply(

`╭━━━〔 👁️ AUTO VIEW 〕━━━╮

${enabled
    ? "🟢 Enabled"
    : "🔴 Disabled"}

JLEY-XMD will ${
enabled
    ? "automatically view"
    : "stop viewing"
} WhatsApp status updates.

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};