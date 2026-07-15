export default {

    name: "hidetag",

    aliases: ["htag"],

    category: "group",

    description: "Mention all members without listing them.",

    usage: ".hidetag <message>",

    permissions: {
        group: true,
        admin: true
    },

    async execute(ctx) {

        const text =
            ctx.args.join(" ");

        if (!text) {
            return ctx.reply(
                "❌ Please provide a message.\n\nExample:\n.hidetag Meeting starts now!"
            );
        }

        const mentions =
            ctx.members.map(
                member => member.id
            );

        await ctx.client.sendMessage(
            ctx.chat,
            {
                text:
`🤖 ${ctx.botName}

👥 Members: ${ctx.members.length}

${text}`,
            }
        );

    }

};