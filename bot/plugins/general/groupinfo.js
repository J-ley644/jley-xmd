export default {

    name: "groupinfo",

    category: "general",

    description: "Show group information",

    permissions: {},


    async execute(ctx) {


        if (!ctx.isGroup) {

            return ctx.reply(
                "❌ This command only works in groups."
            );

        }


        console.log(
            "BOT:",
            ctx.client.user.id
        );


        console.log(
            "ADMINS:",
            ctx.admins
        );


        await ctx.reply(

`╭━━━〔 GROUP INFO 〕━━━╮

👥 Members:
${ctx.members.length}

👑 Admins:
${ctx.admins.length}

🛡 You Admin:
${ctx.isAdmin ? "Yes" : "No"}

🤖 Bot Admin:
${ctx.isBotAdmin ? "Yes" : "No"}

📌 Chat:
${ctx.chat}

╰━━━━━━━━━━━━━━╯`

        );


    }

};