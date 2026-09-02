import crypto from "crypto";

import {
generateWAMessageContent
} from "@whiskeysockets/baileys";

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

    if (!ctx.isReply) {

        return ctx.reply(


`❌ Reply to an image or video.

Example:

Reply to a photo or video, then send:

.togroupstatus`
);


    }

    if (
        !ctx.isImage &&
        !ctx.isVideo
    ) {

        return ctx.reply(
            "❌ The replied message must be an image or video."
        );

    }

    try {

        await ctx.react("📤");

        const buffer =
            await ctx.downloadBuffer();

        if (!buffer) {

            throw new Error(
                "Failed to download media"
            );

        }

        const content =
            ctx.isImage
                ? {
                    image: buffer
                }
                : {
                    video: buffer
                };

        const mediaMessage =
            await generateWAMessageContent(
                content,
                {
                    upload:
                        ctx.client.waUploadToServer,

                    logger:
                        ctx.client.logger,

                    jid:
                        ctx.chat
                }
            );

        const mediaKey =
            ctx.isImage
                ? "imageMessage"
                : "videoMessage";

        const media =
            mediaMessage[mediaKey];

        if (!media) {

            throw new Error(
                "Failed to generate media message"
            );

        }

        media.contextInfo = {
            ...(media.contextInfo || {}),

            isGroupStatus:
                true
        };

        const groupStatusMessage = {

            messageContextInfo: {

                messageSecret:
                    crypto.randomBytes(32)

            },

            groupStatusMessageV2: {

                message:
                    mediaMessage

            }

        };

        await ctx.client.sendMessage(
            ctx.chat,
            groupStatusMessage
        );

        await ctx.react("✅");

        return ctx.reply(
            "✅ Group Status posted successfully."
        );

    } catch (error) {

        console.error(
            "Group Status error:",
            error
        );

        await ctx.react("❌");

        return ctx.reply(
            "❌ Failed to post Group Status."
        );

    }

}


};
