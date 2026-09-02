export default {

    name: "leave",

    aliases: [
        "exit"
    ],

    category: "group",

    description: "Make the bot leave the group",

    usage: ".leave",

    permissions: {
        group: true
    },

    async execute(ctx) {

        try {

            await ctx.react("🚪");

            await ctx.reply(
                "👋 JLEY-XMD is leaving this group. Goodbye!"
            );

            await ctx.client.groupLeave(
                ctx.chat
            );

        } catch (error) {

            console.error(
                "Leave group error:",
                error
            );

            await ctx.reply(
                "❌ Failed to leave the group."
            );

        }

    }

};