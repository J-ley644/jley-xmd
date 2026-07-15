export default {

    name: "open",

    aliases: [],

    category: "group",

    description: "Open the group for everyone.",

    usage: ".open",

    permissions: {
        group: true,
        admin: true,
        botAdmin: true
    },

    async execute(ctx) {

        await ctx.client.groupSettingUpdate(
            ctx.chat,
            "not_announcement"
        );

        await ctx.reply(
`🤖 ${ctx.botName}

✅ Group is now open.`
        );

    }

};