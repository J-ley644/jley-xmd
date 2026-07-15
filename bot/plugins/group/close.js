export default {

    name: "close",

    aliases: [],

    category: "group",

    description: "Only admins can send messages.",

    usage: ".close",

    permissions: {
        group: true,
        admin: true,
        botAdmin: true
    },

    async execute(ctx) {

        await ctx.client.groupSettingUpdate(
            ctx.chat,
            "announcement"
        );

        await ctx.reply(
`🤖 ${ctx.botName}

🔒 Group has been closed.`
        );

    }

};