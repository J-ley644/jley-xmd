export default {

    name: "link",

    aliases: [],

    category: "group",

    description: "Get the group invite link.",

    usage: ".link",

    permissions: {
        group: true,
        admin: true
    },

    async execute(ctx) {

        const code =
            await ctx.client.groupInviteCode(
                ctx.chat
            );

        await ctx.reply(
`🤖 ${ctx.botName}

🔗 Group Invite Link

https://chat.whatsapp.com/${code}`
        );

    }

};