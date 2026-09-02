
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

        // ---------------------------------------------------------
        // Validate reply
        // ---------------------------------------------------------

        if (!ctx.isReply) {

            return ctx.reply(
`❌ Reply to an image or video.

Example:

Reply to a photo or video, then send:

.togroupstatus`
            );

        }


        // ---------------------------------------------------------
        // Validate media
        // ---------------------------------------------------------

        if (!ctx.isImage && !ctx.isVideo) {

            return ctx.reply(
                "❌ The replied message must be an image or video."
            );

        }


        try {

            await ctx.react("📤");


            // -----------------------------------------------------
            // Download replied media
            // -----------------------------------------------------

            const buffer =
                await ctx.downloadBuffer();


            if (
                !buffer ||
                !Buffer.isBuffer(buffer) ||
                buffer.length === 0
            ) {

                throw new Error(
                    "Failed to download media."
                );

            }


            console.log(
                "GROUP STATUS MEDIA:",
                {
                    type:
                        ctx.isImage
                            ? "image"
                            : "video",

                    size:
                        buffer.length,

                    jid:
                        ctx.chat
                }
            );


            // -----------------------------------------------------
            // Prepare media
            // -----------------------------------------------------

            const mediaContent =
                ctx.isImage
                    ? {
                        image: buffer
                    }
                    : {
                        video: buffer
                    };


            const preparedMedia =
                await generateWAMessageContent(
                    mediaContent,
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
                !preparedMedia ||
                !preparedMedia[mediaKey]
            ) {

                throw new Error(
                    `Failed to prepare ${mediaKey}.`
                );

            }


            // -----------------------------------------------------
            // IMPORTANT:
            // Mark the actual media as Group Status.
            // -----------------------------------------------------

            preparedMedia[mediaKey].contextInfo = {

                ...(preparedMedia[mediaKey].contextInfo || {}),

                isGroupStatus: true

            };


            // -----------------------------------------------------
            // Generate Group Status secret
            // -----------------------------------------------------

            const messageSecret =
                crypto.randomBytes(32);


            // -----------------------------------------------------
            // Build Group Status V2 message
            // -----------------------------------------------------

            const statusMessage = {

                messageContextInfo: {

                    messageSecret

                },

                groupStatusMessageV2: {

                    message: {

                        ...preparedMedia,

                        messageContextInfo: {

                            messageSecret

                        }

                    }

                }

            };


            console.log(
                "GROUP STATUS BUILD:",
                {
                    type:
                        ctx.isImage
                            ? "image"
                            : "video",

                    group:
                        ctx.chat,

                    mediaKey,

                    hasSecret:
                        Boolean(messageSecret),

                    hasMedia:
                        Boolean(
                            statusMessage
                                .groupStatusMessageV2
                                .message[mediaKey]
                        ),

                    isGroupStatus:
                        Boolean(
                            preparedMedia[mediaKey]
                                .contextInfo
                                ?.isGroupStatus
                        )
                }
            );


            // -----------------------------------------------------
            // Generate complete WhatsApp message
            // -----------------------------------------------------

            const generatedMessage =
                generateWAMessageFromContent(
                    ctx.chat,
                    statusMessage,
                    {
                        userJid:
                            ctx.client.user?.id
                    }
                );


            if (
                !generatedMessage ||
                !generatedMessage.message
            ) {

                throw new Error(
                    "Failed to generate Group Status message."
                );

            }


            console.log(
                "GROUP STATUS RELAY:",
                {
                    remoteJid:
                        generatedMessage.key?.remoteJid,

                    messageId:
                        generatedMessage.key?.id,

                    contentType:
                        Object.keys(
                            generatedMessage.message || {}
                        )
                }
            );


            // -----------------------------------------------------
            // Relay Group Status
            // -----------------------------------------------------

            await ctx.client.relayMessage(
                ctx.chat,
                generatedMessage.message,
                {
                    messageId:
                        generatedMessage.key.id,

                    useCachedGroupMetadata:
                        true
                }
            );


            // -----------------------------------------------------
            // Success
            // -----------------------------------------------------

            await ctx.react("✅");


            return ctx.reply(
                "✅ Group Status posted successfully."
            );


        } catch (error) {

            console.error(
                "======================================"
            );

            console.error(
                "GROUP STATUS ERROR"
            );

            console.error(
                "Message:",
                error?.message
            );

            console.error(
                "Stack:",
                error?.stack
            );

            console.error(
                "======================================"
            );


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

