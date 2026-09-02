
export default {

    name: "togroupstatus",

    aliases: [
        "groupstatus",
        "statusgroup"
    ],

    category: "group",

    description:
        "Post a replied image or video as a Group Status",

    usage:
        ".togroupstatus (reply to image/video)",

    permissions: {
        group: true,
        botAdmin: true,
        botOwnerOrJleyOwner: true
    },

    async execute(ctx) {

        // Make sure the command is replying to something
        if (!ctx.isReply) {

            return ctx.reply(
`❌ Reply to an image or video.

Example:

Reply to a photo or video, then send:

.togroupstatus`
            );

        }

        // Only allow images and videos
        if (!ctx.isImage && !ctx.isVideo) {

            return ctx.reply(
                "❌ The replied message must be an image or video."
            );

        }

        try {

            await ctx.react("📤");

            // Download the replied media
            const buffer =
                await ctx.downloadBuffer();

            if (!buffer) {

                throw new Error(
                    "Failed to download media"
                );

            }

            /*
             * Send the media as a Group Status.
             *
             * We intentionally do NOT use:
             *
             * generateWAMessageContent()
             *
             * or:
             *
             * groupStatusMessageV2
             *
             *
             * Baileys handles the media preparation
             * when the groupStatusMessage object is
             * passed directly to sendMessage().
             */

            if (ctx.isImage) {

                await ctx.client.sendMessage(
                    ctx.chat,
                    {
                        groupStatusMessage: {
                            image: buffer
                        }
                    }
                );

            } else {

                await ctx.client.sendMessage(
                    ctx.chat,
                    {
                        groupStatusMessage: {
                            video: buffer
                        }
                    }
                );

            }

            // Success reaction
            await ctx.react("✅");

            return ctx.reply(
                "✅ Group Status posted successfully."
            );

        } catch (error) {

            console.error(
                "Group Status error:",
                error
            );

            // Failure reaction
            try {
                await ctx.react("❌");
            } catch {}

            return ctx.reply(
                `❌ Failed to post Group Status.

Error: ${error?.message || "Unknown error"}`
            );

        }

    }

};

