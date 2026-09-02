
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

        /*
         * ----------------------------------------------------------
         * Validate reply
         * ----------------------------------------------------------
         */

        if (!ctx.isReply) {

            return ctx.reply(
`❌ Reply to an image or video.

Example:

Reply to a photo or video, then send:

.togroupstatus`
            );

        }


        /*
         * ----------------------------------------------------------
         * Validate media type
         * ----------------------------------------------------------
         */

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


            /*
             * ------------------------------------------------------
             * Download replied media
             * ------------------------------------------------------
             */

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


            /*
             * ------------------------------------------------------
             * Debug information
             * ------------------------------------------------------
             */

            console.log(
                "GROUP STATUS MEDIA:",
                {
                    type:
                        ctx.isImage
                            ? "image"
                            : "video",

                    isBuffer:
                        Buffer.isBuffer(buffer),

                    size:
                        buffer.length,

                    jid:
                        ctx.chat
                }
            );


            /*
             * ------------------------------------------------------
             * Build normal WhatsApp media content.
             *
             * IMPORTANT:
             *
             * generateWAMessageContent() prepares/uploads
             * the actual image/video and creates:
             *
             * imageMessage
             *
             * or
             *
             * videoMessage
             * ------------------------------------------------------
             */

            const mediaContent =
                ctx.isImage
                    ? {
                        image: buffer
                    }
                    : {
                        video: buffer
                    };


            const mediaMessage =
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


            /*
             * ------------------------------------------------------
             * Make sure media generation succeeded.
             * ------------------------------------------------------
             */

            const mediaKey =
                ctx.isImage
                    ? "imageMessage"
                    : "videoMessage";


            if (
                !mediaMessage ||
                !mediaMessage[mediaKey]
            ) {

                throw new Error(
                    `Failed to generate ${mediaKey}.`
                );

            }


            /*
             * ------------------------------------------------------
             * Generate a fresh message secret.
             *
             * Group Status V2 requires messageSecret.
             * ------------------------------------------------------
             */

            const messageSecret =
                crypto.randomBytes(32);


            /*
             * ------------------------------------------------------
             * Add Group Status context information.
             * ------------------------------------------------------
             */

            mediaMessage[mediaKey].contextInfo = {

                ...(mediaMessage[mediaKey].contextInfo || {}),

                isGroupStatus:
                    true

            };


            /*
             * ------------------------------------------------------
             * Build Group Status V2 message.
             *
             * This is the important part.
             * ------------------------------------------------------
             */

            const groupStatusContent = {

                messageContextInfo: {

                    messageSecret

                },

                groupStatusMessageV2: {

                    message: {

                        ...mediaMessage,

                        messageContextInfo: {

                            messageSecret

                        }

                    }

                }

            };


            /*
             * ------------------------------------------------------
             * Convert the protobuf content into a complete
             * WhatsApp WebMessageInfo.
             *
             * We DO NOT use sendMessage() here.
             * ------------------------------------------------------
             */

            const generatedMessage =
                generateWAMessageFromContent(
                    ctx.chat,
                    groupStatusContent,
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


            /*
             * ------------------------------------------------------
             * Relay the already-generated protobuf message.
             *
             * This avoids sendMessage() trying to process
             * groupStatusMessageV2 as normal media.
             * ------------------------------------------------------
             */

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


            /*
             * ------------------------------------------------------
             * Success
             * ------------------------------------------------------
             */

            await ctx.react("✅");


            return ctx.reply(
                "✅ Group Status posted successfully."
            );


        } catch (error) {

            /*
             * ------------------------------------------------------
             * Detailed error logging
             * ------------------------------------------------------
             */

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

