export default {

    name: "profile",

    aliases: [
        "me"
    ],

    category: "general",

    description: "Show your WhatsApp profile information",

    usage: ".profile",

    permissions: {},


    async execute(ctx) {


        const number =
            ctx.number || "Unknown";



        const chatType =
            ctx.isGroup
            ? (ctx.groupMetadata?.subject || "Group Chat")
            : "Private Chat";



        await ctx.reply(

`╭━━━〔 👤 PROFILE 〕━━━╮

📱 WhatsApp ID
➜ +${number}

💬 Chat
➜ ${chatType}

🤖 Bot
➜ ${ctx.botName}

━━━━━━━━━━━━━━━━━━

🟢 Status
➜ Active

⚡ Engine
➜ JLEY-XMD Core

╰━━━━━━━━━━━━━━━━━━╯`

        );


    }

};