export default {

    name: "setgpp",

    aliases: [
        "setgrouppp",
        "setgroupdp"
    ],

    category: "general",

    description: "Set the group's profile picture",

    usage: ".setgpp (reply to an image)",

    permissions: {
        botOwnerOrJleyOwner: true
    },

    async execute(ctx) {

        if (!ctx.isGroup) {

            return ctx.reply(
                "❌ This command can only be used in a group."
            );

        }

        if (!ctx.isReply) {

            return ctx.reply(
`❌ Reply to an image.

Example:

Reply to a photo then send

.setgpp`
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
                ctx.jid,
                buffer
            );

            await ctx.reply(
`✅ Group profile picture updated successfully.

👥 ${ctx.groupName || "Group"}

The new group profile picture is now active.`
            );

        }

        catch (error) {

            console.error(
                "Group profile picture update failed:",
                error
            );

            await ctx.reply(
                "❌ Failed to update the group profile picture."
            );

        }

    }

};