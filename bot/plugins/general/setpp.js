export default {

    name: "setpp",

    aliases: [
        "setprofilepic",
        "setprofile"
    ],

    category: "general",

    description: "Set the bot's profile picture",

    usage: ".setpp (reply to an image)",

    permissions: {
        botOwnerOrJleyOwner: true
    },

    async execute(ctx) {

        if (!ctx.isReply) {

            return ctx.reply(
`❌ Reply to an image.

Example:

Reply to a photo then send

.setpp`
            );

        }

        if (!ctx.isImage) {

            return ctx.reply(
                "❌ The replied message must be an image."
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            await ctx.client.updateProfilePicture(
                ctx.client.user.id,
                buffer
            );

            await ctx.reply(
`✅ Bot profile picture updated successfully.

🤖 ${ctx.botName}

The new profile picture is now active.`
            );

        } catch (error) {

            console.error(
                "Profile picture update failed:",
                error
            );

            await ctx.reply(
                "❌ Failed to update the bot profile picture."
            );

        }

    }

};