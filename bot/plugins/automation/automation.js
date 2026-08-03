import automationStore from "../../system/automationStore.js";

export default {

    name: "automation",

    aliases: [
        "automations",
        "autos"
    ],

    category: "automation",

    description: "Manage automation settings",

    usage: ".automation",

    permissions: {},


    async execute(ctx) {

        const settings =
            automationStore.get(ctx.sender);


        const text =

`╭━━━〔 🤖 AUTOMATION CENTER 〕━━━╮

👁️ Auto View
${settings.autoview ? "🟢 Enabled" : "🔴 Disabled"}

❤️ Auto Like
${settings.autolike ? "🟢 Enabled" : "🔴 Disabled"}

📖 Auto Read
${settings.autoread ? "🟢 Enabled" : "🔴 Disabled"}

💬 Auto Reply
${settings.autoreply ? "🟢 Enabled" : "🔴 Disabled"}

━━━━━━━━━━━━━━━━━━

❤️ Reaction Emoji

${settings.autolikeEmoji}

━━━━━━━━━━━━━━━━━━

💬 Reply Message

${settings.autoreplyText}

━━━━━━━━━━━━━━━━━━

⚡ Quick Commands

.autoview on/off
.autolike on/off
.autoread on/off
.autoreply on/off

.autolikeemoji ❤️
.autoreplymsg <message>

━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`;

        await ctx.reply(text);

    }

};