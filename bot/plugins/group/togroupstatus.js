
import crypto from "crypto";

import {
    generateWAMessageContent,
    generateWAMessageFromContent
} from "@whiskeysockets/baileys";


/*
 * Prepare media while capturing the WhatsApp
 * media handle. Group Status V2 requires the
 * media_id on the outer relay attributes.
 */
async function prepareGroupStatusMedia(
    client,
    groupJid,
    content
) {

    let mediaHandle = null;

    const prepared =
        await generateWAMessageContent(
            content,
            {
                jid: groupJid,

                userJid:
                    client.user?.id,

                logger:
                    client.logger,

                upload: async (
    stream,
    options = {}
) => {

    const result =
        await client.waUploadToServer(
            stream,
            options
        );

    console.log(
        "GROUP STATUS UPLOAD RESULT:",
        {
            hasHandle: Boolean(result?.handle),
            handle: result?.handle,
            hasMediaUrl: Boolean(result?.mediaUrl),
            hasDirectPath: Boolean(result?.directPath)
        }
    );

    mediaHandle =
        result?.handle ||
        result?.mediaUrl ||
        result?.directPath ||
        null;

    return result;
}
            }
        );


    if (!prepared) {

        throw new Error(
            "Failed to prepare Group Status media."
        );

    }


    return {
        prepared,
        mediaHandle
    };

}


/*
 * Determine the media type expected by
 * WhatsApp's outer message stanza.
 */
function getGroupStatusMediaType(
    message
) {

    if (message?.imageMessage) {

        return "image";

    }

    if (message?.videoMessage) {

        return message.videoMessage
            .gifPlayback
            ? "gif"
            : "video";

    }

    if (message?.audioMessage) {

        return message.audioMessage.ptt
            ? "ptt"
            : "audio";

    }

    if (message?.documentMessage) {

        return "document";

    }

    if (message?.stickerMessage) {

        return "sticker";

    }

    return null;

}


/*
 * Send Group Status V2 using the existing
 * RC14 socket.
 *
 * Important:
 *
 * - Destination remains groupJid.
 * - We do NOT use status@broadcast.
 * - We do NOT use sendMessage().
 * - We do NOT manually modify node_modules.
 * - media_id is supplied to relayMessage().
 */
async function sendGroupStatus(
    client,
    groupJid,
    content
) {

    if (
        !groupJid ||
        !groupJid.endsWith("@g.us")
    ) {

        throw new Error(
            "Group Status requires a @g.us group JID."
        );

    }


    if (!client?.user?.id) {

        throw new Error(
            "WhatsApp socket is not ready."
        );

    }


    /*
     * Prepare the actual image/video message.
     */
    const {
        prepared,
        mediaHandle
    } =
        await prepareGroupStatusMedia(
            client,
            groupJid,
            content
        );


    const mediaType =
        getGroupStatusMediaType(
            prepared
        );


    if (!mediaType) {

        throw new Error(
            "Could not determine Group Status media type."
        );

    }


    /*
     * Group Status V2 wrapper.
     *
     * The message secret is included in the
     * outer and inner message context.
     */
    const messageSecret =
        crypto.randomBytes(32);


    const statusMessage = {

        messageContextInfo: {
            messageSecret
        },

        groupStatusMessageV2: {

            message: {

                ...prepared,

                messageContextInfo: {
                    messageSecret
                }

            }

        }

    };


    /*
     * Build the final WAMessage.
     */
    const generated =
        generateWAMessageFromContent(
            groupJid,
            statusMessage,
            {
                userJid:
                    client.user.id
            }
        );


    if (
        !generated?.message
    ) {

        throw new Error(
            "Failed to generate Group Status message."
        );

    }


    /*
     * CRITICAL:
     *
     * Group Status media needs these attributes
     * on the OUTER relay.
     *
     * media_id comes from waUploadToServer().
     */
    const additionalAttributes = {

        mediatype:
            mediaType

    };


    if (mediaHandle) {

        additionalAttributes.media_id =
            mediaHandle;

    }


    console.log(
        "GROUP STATUS RELAY:",
        {
            group: groupJid,

            mediaType,

            hasMediaId:
                Boolean(mediaHandle),

            messageId:
                generated.key?.id,

            contentType:
                Object.keys(
                    generated.message || {}
                )
        }
    );


    /*
     * Use the existing RC14 group encryption
     * and relay implementation.
     */
    await client.relayMessage(
        groupJid,
        generated.message,
        {

            messageId:
                generated.key.id,

            useCachedGroupMetadata:
                true,

            additionalAttributes

        }
    );


    return generated;

}


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
                "❌ Reply to an image or video."
            );

        }


        if (
            !ctx.isImage &&
            !ctx.isVideo
        ) {

            return ctx.reply(
                "❌ The replied message must contain an image or video."
            );

        }


        try {

            await ctx.react("📤");


            /*
             * Download the replied media.
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


            const type =
                ctx.isImage
                    ? "image"
                    : "video";


            console.log(
                "GROUP STATUS PREPARE:",
                {
                    type,

                    size:
                        buffer.length,

                    group:
                        ctx.chat
                }
            );


            /*
             * Prepare the normal Baileys media
             * content.
             *
             * Do NOT put groupStatusMessageV2
             * inside generateWAMessageContent().
             */
            const mediaContent =
                ctx.isImage

                    ? {
                        image: buffer
                    }

                    : {
                        video: buffer
                    };


            /*
             * Send Group Status V2.
             */
            const result =
    await ctx.client.sendGroupStatus(
        ctx.chat,
        mediaContent
    );


            console.log(
                "GROUP STATUS SENT:",
                {
                    group:
                        result.key?.remoteJid,

                    messageId:
                        result.key?.id,

                    type
                }
            );


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
                `❌ Failed to post Group Status.\n\nError: ${
                    error?.message ||
                    "Unknown error"
                }`
            );

        }

    }

};

