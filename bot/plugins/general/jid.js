export default {

    name: "jid",

    aliases: [],

    category: "general",

    description: "Show current chat JID",

    usage: ".jid",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(

`📌 Chat Information

🆔 JID:
${ctx.chat}

👤 Sender:
${ctx.sender}`

        );

    }

};