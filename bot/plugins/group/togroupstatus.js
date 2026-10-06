import crypto from "crypto";

import {
    generateWAMessageContent,
    generateWAMessageFromContent
} from "@whiskeysockets/baileys";


/*
|--------------------------------------------------------------------------
| Prepare Group Status Media
|--------------------------------------------------------------------------
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
                            hasHandle:
                                Boolean(result?.handle),

                            handle:
                                result?.handle,

                            hasMediaUrl:
                                Boolean(result?.mediaUrl),

                            hasDirectPath:
                                Boolean(result?.directPath)
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
|--------------------------------------------------------------------------
| Determine Group Status Media Type
|--------------------------------------------------------------------------
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
|--------------------------------------------------------------------------
| Convert Hex Color To WhatsApp ARGB
|--------------------------------------------------------------------------
*/

function hexToArgb(
    hex = "#000000"
) {

    const clean =
        String(hex)
            .replace("#", "")
            .trim();


    if (!/^[0-9a-fA-F]{6}$/.test(clean)) {

        return 0xff000000;

    }


    const r =
        parseInt(
            clean.slice(0, 2),
            16
        );


    const g =
        parseInt(
            clean.slice(2, 4),
            16
        );


    const b =
        parseInt(
            clean.slice(4, 6),
            16
        );


    return (
        ((0xff << 24) |
            (r << 16) |
            (g << 8) |
            b) >>> 0
    );

}


/*
|--------------------------------------------------------------------------
| Apply Group Status Media Context
|--------------------------------------------------------------------------
*/

function applyGroupStatusMediaContext(
    prepared
) {

    const contextInfo = {

        forwardingScore:
            0,

        featureEligibilities: {

            canBeReshared:
                true,

            canReceiveMultiReact:
                true

        },

        pairedMediaType:
            0,

        statusSourceType:
            4,

        isGroupStatus:
            true,

        statusAttributions: [

            {
                type: 10
            }

        ]

    };


    if (prepared?.imageMessage) {

        prepared.imageMessage.contextInfo =
            contextInfo;

    }


    if (prepared?.videoMessage) {

        prepared.videoMessage.contextInfo =
            contextInfo;

    }


    if (prepared?.audioMessage) {

        prepared.audioMessage.contextInfo =
            contextInfo;

    }


    return prepared;

}


/*
|--------------------------------------------------------------------------
| Build Group Status V2 Message
|--------------------------------------------------------------------------
*/

function buildGroupStatusMessage(
    groupJid,
    content,
    userJid
) {

    const messageSecret =
        crypto.randomBytes(32);


    const statusMessage = {

        messageContextInfo: {

            messageSecret

        },

        groupStatusMessageV2: {

            message: {

                ...content,

                messageContextInfo: {

                    messageSecret

                }

            }

        }

    };


    const generated =
        generateWAMessageFromContent(
            groupJid,
            statusMessage,
            {
                userJid
            }
        );


    if (!generated?.message) {

        throw new Error(
            "Failed to generate Group Status message."
        );

    }


    return generated;

}


/*
|--------------------------------------------------------------------------
| Send Text Group Status
|--------------------------------------------------------------------------
*/

async function sendGroupStatusText(
    client,
    groupJid,
    text,
    background = "#000000",
    font = 0
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


    if (
        !text ||
        !String(text).trim()
    ) {

        throw new Error(
            "Group Status text cannot be empty."
        );

    }


    const content = {

        extendedTextMessage: {

            text:
                String(text).trim(),

            backgroundArgb:
                hexToArgb(background),

            font:
                Number.isInteger(font)
                    ? font
                    : 0

        }

    };


    const generated =
        buildGroupStatusMessage(
            groupJid,
            content,
            client.user.id
        );


    console.log(
        "GROUP TEXT STATUS RELAY:",
        {
            group:
                groupJid,

            messageId:
                generated.key?.id,

            textLength:
                String(text).trim().length
        }
    );


    await client.relayMessage(
        groupJid,
        generated.message,
        {
            messageId:
                generated.key.id,

            useCachedGroupMetadata:
                true
        }
    );


    return generated;

}


/*
|--------------------------------------------------------------------------
| Send Media Group Status
|--------------------------------------------------------------------------
*/

async function sendGroupStatusMedia(
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
     * Prepare media.
     */

    let {
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
     * Apply Group Status metadata.
     */

    prepared =
        applyGroupStatusMediaContext(
            prepared
        );


    /*
     * Build Group Status V2 message.
     */

    const generated =
        buildGroupStatusMessage(
            groupJid,
            prepared,
            client.user.id
        );


    /*
     * Outer relay attributes.
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
            group:
                groupJid,

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
     * Relay.
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


/*
|--------------------------------------------------------------------------
| Plugin
|--------------------------------------------------------------------------
*/

export default {

    name:
        "togroupstatus",

    aliases: [
        "groupstatus",
        "statusgroup"
    ],

    category:
        "group",

    description:
        "Post text, image, video or audio as a Group Status",

    usage:
        ".togroupstatus <text> OR reply to image/video/audio",

    permissions: {

        group:
            true,

        botAdmin:
            true,

        botOwnerOrJleyOwner:
            true

    },


    async execute(ctx) {

        /*
        |--------------------------------------------------------------------------
        | TEXT GROUP STATUS
        |--------------------------------------------------------------------------
        |
        | Example:
        |
        | .togroupstatus Hello everyone
        |
        */

        if (!ctx.isReply) {

            const text =
                Array.isArray(ctx.args)
                    ? ctx.args.join(" ").trim()
                    : "";


            if (!text) {

                return ctx.reply(
                    "❌ Usage: .togroupstatus <text>\n\nOr reply to an image, video or audio."
                );

            }


            try {

                await ctx.react("📤");


                const result =
                    await sendGroupStatusText(
                        ctx.client,
                        ctx.chat,
                        text
                    );


                console.log(
                    "GROUP TEXT STATUS SENT:",
                    {
                        group:
                            result.key?.remoteJid,

                        messageId:
                            result.key?.id
                    }
                );


                await ctx.react("✅");


                return ctx.reply(
                    "✅ Text Group Status posted successfully."
                );


            } catch (error) {

                console.error(
                    "======================================"
                );

                console.error(
                    "GROUP TEXT STATUS ERROR"
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
                    `❌ Failed to post Text Group Status.\n\nError: ${
                        error?.message ||
                        "Unknown error"
                    }`
                );

            }

        }


        /*
        |--------------------------------------------------------------------------
        | REPLIED MEDIA GROUP STATUS
        |--------------------------------------------------------------------------
        |
        | Supported:
        |
        | image
        | video
        | audio
        | voice note
        |
        */

        if (
            !ctx.isImage &&
            !ctx.isVideo &&
            !ctx.isAudio
        ) {

            return ctx.reply(
                "❌ The replied message must contain an image, video or audio."
            );

        }


        try {

            await ctx.react("📤");


            /*
             * Download replied media.
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
                    : ctx.isVideo
                        ? "video"
                        : "audio";


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
             * Prepare normal Baileys media content.
             */

            let mediaContent;


            if (ctx.isImage) {

                mediaContent = {

                    image:
                        buffer

                };

            } else if (ctx.isVideo) {

                mediaContent = {

                    video:
                        buffer

                };

            } else {

                mediaContent = {

                    audio:
                        buffer,

                    mimetype:
                        ctx.media?.audioMessage?.mimetype ||
                        "audio/ogg; codecs=opus",

                    ptt:
                        Boolean(
                            ctx.media?.audioMessage?.ptt
                        )

                };

            }


            /*
             * Send Group Status V2.
             */

            const result =
                await sendGroupStatusMedia(
                    ctx.client,
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
                `✅ ${
                    type === "audio"
                        ? "Audio"
                        : type === "image"
                            ? "Image"
                            : "Video"
                } Group Status posted successfully.`
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