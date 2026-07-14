export default {

    name: "profile",

    aliases: ["me"],

    category: "general",

    description: "Show your WhatsApp profile information",

    usage: ".profile",

    permissions: {},

    async execute(ctx) {

        const user = ctx.sender.split("@")[0];

        const text = `
╭━━━〔 👤 PROFILE 〕━━━╮

📱 Number:
+${user}

💬 Chat:
${ctx.chat}

🤖 Bot:
${ctx.botName}

━━━━━━━━━━━━━━━━━━

Thank you for using JLEY-XMD ❤️

╰━━━━━━━━━━━━━━━━━━╯
`;

        await ctx.reply(text);

    }

};