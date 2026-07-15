export default {

    name: "promote",

    aliases: [],

    category: "group",

    description: "Promote a member to admin.",

    usage: ".promote",

    permissions: {
        group: true,
        admin: true,
        botAdmin: true
    },

    async execute(ctx) {

        const target =
            ctx.message.message
                ?.extendedTextMessage
                ?.contextInfo
                ?.participant;

        if (!target) {
            return ctx.reply("❌ Reply to the user's message.");
        }

        await ctx.client.groupParticipantsUpdate(
            ctx.chat,
            [target],
            "promote"
        );

        await ctx.reply("✅ Member promoted.");

    }

};