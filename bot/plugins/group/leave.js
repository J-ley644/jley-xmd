export default {

    name: "leave",

    aliases: [
        "exit"
    ],

    category: "group",

    description:
        "Remove the user who typed the command from the group",

    usage: ".leave",

    permissions: {
        group: true,
        botAdmin: true
    },

    async execute(ctx) {

        try {

            await ctx.react("🚪");


            /*
             * The command sender, not the bot.
             */
            const target =
                ctx.sender;


            if (!target) {

                throw new Error(
                    "Could not identify the command sender."
                );

            }


            /*
             * Remove the sender from the group.
             *
             * groupParticipantsUpdate() requires
             * the bot to be a group admin.
             */
            await ctx.client.groupParticipantsUpdate(
                ctx.chat,
                [target],
                "remove"
            );


        } catch (error) {

            console.error(
                "Leave command error:",
                error
            );


            try {

                await ctx.react("❌");

            } catch {}


            await ctx.reply(
                `❌ Failed to remove you from the group.\n\n${
                    error.message ||
                    "Unknown error"
                }`
            );

        }

    }

};