export default {

    name: "tagall",

    aliases: [
        "everyone"
    ],

    category: "owner",

    description: "Mention all group members",

    usage: ".tagall [message]",

    permissions: { botOwner: true },

    async execute(ctx) {

        const announcement =
            ctx.args.join(" ") ||
            "📢 Attention everyone!";


        const mentions =
            ctx.members.map(
                member => member.id
            );


        let message =

`╭━━━〔 📢 GROUP ALERT 〕━━━╮

🤖 ${ctx.botName}

👥 Members
${ctx.members.length}

━━━━━━━━━━━━━━━━━━

📌 Announcement

${announcement}

━━━━━━━━━━━━━━━━━━

`;


        for (const member of ctx.members) {

            const number =
                member.id
                    .split("@")[0]
                    .split(":")[0];


            message +=
                `👤 @${number}\n`;

        }


        message +=

`
━━━━━━━━━━━━━━━━━━

⚡ Sent by
${ctx.sender.split("@")[0]}

╰━━━━━━━━━━━━━━━━━━╯`;


        await ctx.client.sendMessage(

            ctx.chat,

            {
                text: message,
                mentions
            }

        );

    }

};