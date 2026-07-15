export default {

    name: "kick",

    aliases: ["remove"],

    category: "group",

    description: "Remove a member from the group.",

    usage: ".kick @user",

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

            return ctx.reply(
                "❌ Reply to a user's message to kick them."
            );

        }

        if (target === ctx.sender) {

            return ctx.reply(
                "❌ You cannot kick yourself."
            );

        }

        await ctx.client.groupParticipantsUpdate(
            ctx.chat,
            [target],
            "remove"
        );

        await ctx.reply("✅ Member removed.");

    }

};