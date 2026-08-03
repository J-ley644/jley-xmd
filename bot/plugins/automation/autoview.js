import automationStore from "../../system/automationStore.js";

export default {

    name: "autoview",

    aliases: [
        "viewstatus"
    ],

    category: "automation",

    description: "Automatically view WhatsApp status updates",

    usage: ".autoview <on|off>",

    permissions: {},

    async execute(ctx) {

        const option =
            (ctx.args[0] || "").toLowerCase();

        if (!["on", "off"].includes(option)) {

            return ctx.reply(

`╭━━━〔 👁️ AUTO VIEW 〕━━━╮

Usage

.autoview on
.autoview off

━━━━━━━━━━━━━━━━━━

Current:
${automationStore.get(ctx.sender).autoview ? "🟢 Enabled" : "🔴 Disabled"}

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }

        const enabled =
            option === "on";

        automationStore.set(
            ctx.sender,
            "autoview",
            enabled
        );

        await ctx.reply(

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