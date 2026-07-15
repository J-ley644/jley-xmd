export default {

    name: "tagall",

    aliases: ["everyone"],

    category: "group",

    description: "Mention all group members.",

    usage: ".tagall [message]",

    permissions: {
        group: true,
        admin: true
    },

    async execute(ctx) {

        const announcement =
    ctx.args.join(" ") ||
    "📢 Attention everyone!";

        const mentions =
            ctx.members.map(
                member => member.id
            );

        let message =
`🤖 ${ctx.botName}

👥 Members: ${ctx.members.length}

${announcement}

`;

        for (const member of ctx.members) {

            const number =
                member.id
                    .split("@")[0]
                    .split(":")[0];

            message += `@${number}\n`;

        }

        await ctx.client.sendMessage(
            ctx.chat,
            {
                text: message,
                mentions
            }
        );

    }

};