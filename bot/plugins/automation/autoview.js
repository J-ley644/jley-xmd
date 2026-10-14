
import automationStore from "../../system/automationStore.js";

export default {
    name: "autoview",

    aliases: [
        "viewstatus"
    ],

    category: "automation",

    description: "Automatically view WhatsApp status updates",

    usage: ".autoview <on|off>",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {
        const option = String(ctx.args?.[0] || "")
            .trim()
            .toLowerCase();

        // Settings belong to this specific deployment.
        const botIdentity =
            ctx.deploymentId ||
            ctx.client?.deploymentId;

        if (!botIdentity) {
            return ctx.reply(
                "❌ Unable to identify this bot deployment."
            );
        }

        const settings = automationStore.get(botIdentity);

        if (!["on", "off"].includes(option)) {
            return ctx.reply(
`╭━━━〔 👁️ AUTO VIEW 〕━━━╮

Usage

.autoview on
.autoview off

━━━━━━━━━━━━━━━━━━

Current:
${settings.autoview ? "🟢 Enabled" : "🔴 Disabled"}

╰━━━━━━━━━━━━━━━━━━╯`
            );
        }

        const enabled = option === "on";

        automationStore.set(
            botIdentity,
            "autoview",
            enabled
        );

        return ctx.reply(
`╭━━━〔 👁️ AUTO VIEW 〕━━━╮

${enabled ? "🟢 Enabled" : "🔴 Disabled"}

JLEY-XMD will ${
    enabled
        ? "automatically view"
        : "stop viewing"
} WhatsApp status updates.

╰━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
