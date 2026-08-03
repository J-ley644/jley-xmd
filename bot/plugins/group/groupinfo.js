export default {

    name: "groupinfo",

    aliases: [
        "ginfo"
    ],

    category: "group",

    description: "Show group information",

    usage: ".groupinfo",

    permissions: {},

    async execute(ctx) {

        if (!ctx.isGroup) {

            return ctx.reply(
                "❌ This command can only be used inside groups."
            );

        }


        const metadata =
            ctx.groupMetadata;


        const groupName =
            metadata?.subject || "Unknown";


        const description =
            metadata?.desc || "No description";


        const memberCount =
            ctx.members?.length || 0;


        const adminCount =
            ctx.admins?.length || 0;


        const text =

`╭━━━〔 👥 GROUP INFO 〕━━━╮

🏷️ Name

${groupName}

━━━━━━━━━━━━━━━━━━

👥 Members
${memberCount}

👑 Admins
${adminCount}

🛡️ Your Role
${ctx.isAdmin ? "Admin" : "Member"}

🤖 Bot Permission
${ctx.isBotAdmin ? "Admin" : "Not Admin"}

━━━━━━━━━━━━━━━━━━

📝 Description

${description}

🆔 Group ID

${ctx.chat}

━━━━━━━━━━━━━━━━━━

⚡ Powered by JLEY-XMD

╰━━━━━━━━━━━━━━━━━━╯`;

        await ctx.reply(text);

    }

};