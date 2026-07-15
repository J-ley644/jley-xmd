export default {

    name: "profile",

    aliases: ["me"],

    category: "general",

    description: "Show your WhatsApp profile information",

    usage: ".profile",

    permissions: {},

    async execute(ctx) {


        const user =
            ctx.number;


        const text = `
╭━━━〔 👤 PROFILE 〕━━━╮

📱 Number:
+${user}

💬 Chat:
${ctx.isGroup
    ? (ctx.groupMetadata?.subject || "Group Chat")
    : "Private Chat"}

🤖 Bot:
${ctx.botName}

━━━━━━━━━━━━━━━━━━

Thank you for using JLEY-XMD ❤️

╰━━━━━━━━━━━━━━━━━━╯
`;


        await ctx.reply(text);

    }

};