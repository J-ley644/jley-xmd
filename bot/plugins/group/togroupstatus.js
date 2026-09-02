import crypto from "crypto";

import {
    generateWAMessageContent,
    generateWAMessageFromContent
} from "@whiskeysockets/baileys";

export default {

    name: "togroupstatus",

    aliases: [
        "groupstatus",
        "statusgroup"
    ],

    category: "group",

    description: "Post replied image or video as the group Status",

    usage: ".togroupstatus (reply to image/video)",

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

Reply to a photo/video then send

.togroupstatus`
            );

        }

        if (!ctx.isImage && !ctx.isVideo) {

            return ctx.reply(
                "❌ The replied message must be an image or video."
            );

        }

        try {

            await ctx.react("📤");

            const buffer =
                await ctx.downloadBuffer();

            if (!buffer) {

                await ctx.react("❌");

                return ctx.reply(
                    "❌ Failed to download the replied media."
                );

            }

            const content = ctx.isImage
                ? {
                    image: buffer
                }
                : {
                    video: buffer
                };

            const innerMessage =
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

            if (
                innerMessage?.[mediaKey]
            ) {

                innerMessage[
                    mediaKey
                ].contextInfo = {

                    isGroupStatus: true

                };

            }

            const groupStatusMessage = {

                messageContextInfo: {

                    messageSecret:
                        Buffer.from(
                            crypto.randomBytes(32)
                        )

                },

                groupStatusMessageV2: {

                    message:
                        innerMessage

                }

            };

            const fullMessage =
                generateWAMessageFromContent(
                    ctx.chat,
                    groupStatusMessage,
                    {
                        userJid:
                            ctx.client.user.id
                    }
                );

            await ctx.client.relayMessage(
                ctx.chat,
                fullMessage.message,
                {
                    messageId:
                        fullMessage.key.id
                }
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
                "❌ Failed to post the Group Status."
            );

        }

    }

};
