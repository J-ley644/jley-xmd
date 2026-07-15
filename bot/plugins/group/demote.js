export default {

    name: "demote",

    aliases: [],

    category: "group",

    description: "Demote an admin.",

    usage: ".demote",

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
            "demote"
        );

        await ctx.reply("✅ Member demoted.");

    }

};