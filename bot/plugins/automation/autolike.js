import automationStore from "../../system/automationStore.js";

export default {
    name: "autolike",

    aliases: [
        "likestatus",
        "statuslike",
        "reactstatus"
    ],

    category: "automation",

    description: "Automatically react to WhatsApp status updates",

    usage: ".autolike <on|off>",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        const option =
            String(ctx.args?.[0] || "")
                .trim()
                .toLowerCase();

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

        const settings =
            automationStore.get(botIdentity);

        // Show current status
        if (!["on", "off"].includes(option)) {

            return ctx.reply(

`╭━━━〔 ❤️ AUTO LIKE STATUS 〕━━━╮

Current Status

${settings.autolike ? "🟢 Enabled" : "🔴 Disabled"}

Reaction Emoji

${settings.autolikeEmoji}

━━━━━━━━━━━━━━━━━━

Usage

.autolike on
.autolike off

Change Emoji

.autolikeemoji ❤️
.autolikeemoji 🔥

╰━━━━━━━━━━━━━━━━━━╯`

            );
        }

        const enabled = option === "on";

        automationStore.set(
            botIdentity,
            "autolike",
            enabled
        );

        return ctx.reply(

`╭━━━〔 ❤️ AUTO LIKE STATUS 〕━━━╮

Automatic status reactions

${enabled ? "🟢 Enabled" : "🔴 Disabled"}

Reaction Emoji

${settings.autolikeEmoji}

━━━━━━━━━━━━━━━━━━

${enabled
    ? "The bot will now react to WhatsApp statuses."
    : "The bot will stop reacting to WhatsApp statuses."
}

╰━━━━━━━━━━━━━━━━━━╯`

        );
    }
};