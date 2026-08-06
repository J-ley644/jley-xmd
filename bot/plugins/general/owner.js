import config from "../../config/config.js";

export default {

    name: "owner",

    aliases: [
        "creator"
    ],

    category: "general",

    description: "Show bot owner information",

    usage: ".owner",

    permissions: {},

    async execute(ctx) {

        const text =

`╭━━━〔 👑 OWNER PROFILE 〕━━━╮

👤 Name
${config.owner.name}

📞 Contact
+${config.owner.number}

🤖 Bot
${config.botName}

━━━━━━━━━━━━━━━━━━

🚀 Project
WhatsApp Automation Engine

⚡ Role
Developer & Maintainer

━━━━━━━━━━━━━━━━━━

🔥 Powered by JLEY-XMD

╰━━━━━━━━━━━━━━━━━━╯`;

        await ctx.reply(text);

    }

};