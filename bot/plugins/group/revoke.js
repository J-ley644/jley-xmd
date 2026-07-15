export default {

    name: "revoke",

    aliases: [],

    category: "group",

    description: "Reset the group invite link.",

    usage: ".revoke",

    permissions: {
        group: true,
        admin: true,
        botAdmin: true
    },

    async execute(ctx) {

        await ctx.client.groupRevokeInvite(
            ctx.chat
        );

        await ctx.reply(
`🤖 ${ctx.botName}

✅ Group invite link revoked.`
        );

    }

};