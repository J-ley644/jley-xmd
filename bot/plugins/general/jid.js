export default {

    name: "jid",

    aliases: [],

    category: "general",

    description: "Show current chat JID information",

    usage: ".jid",

    permissions: {},


    async execute(ctx) {


        await ctx.reply(

`╭━━━〔 🆔 CHAT INFO 〕━━━╮

💬 Chat ID
➜ ${ctx.chat}

━━━━━━━━━━━━━━━━━━

👤 Sender ID
➜ ${ctx.sender}

━━━━━━━━━━━━━━━━━━

📍 Type
➜ ${
    ctx.isGroup
    ? "Group Chat"
    : "Private Chat"
}

🤖 Bot
➜ ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`

        );


    }

};