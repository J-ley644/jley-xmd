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


        const metadata =
            ctx.groupMetadata;


        const groupName =
            metadata?.subject || "Unknown";


        const description =
            metadata?.desc || "No description";


        await ctx.reply(

`╭━━━〔 🤖 ${ctx.botName} 〕━━━╮

📌 *GROUP INFORMATION*

🏷️ Name:
${groupName}

👥 Members:
${ctx.members.length}

👑 Admins:
${ctx.admins.length}

🛡 Your Status:
${ctx.isAdmin ? "✅ Admin" : "❌ Member"}

🤖 Bot Status:
${ctx.isBotAdmin ? "✅ Admin" : "❌ Not Admin"}

📝 Description:
${description}

🆔 Group ID:
${ctx.chat}

╰━━━━━━━━━━━━━━╯`

        );


    }

};