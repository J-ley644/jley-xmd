export default {

    name: "jid",

    aliases: [],

    category: "owner",

    description: "Show current chat JID information",

    usage: ".jid",

    permissions: { botOwner: true },

    async execute(ctx) {

        return ctx.info(

`🆔 CHAT INFORMATION

💬 Chat ID
${ctx.chat}

👤 Sender ID
${ctx.sender}

📍 Type
${ctx.isGroup ? "Group Chat" : "Private Chat"}

🤖 Bot
${ctx.botName}`

        );

    }

};