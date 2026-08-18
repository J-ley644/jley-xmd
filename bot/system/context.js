/**
 * =====================================================
 * JLEY-XMD Context Builder
 * Context API v5
 *
 * Core
 * User
 * Group
 * Runtime
 * Media Engine
 * Response UI
 * Helper API
 * =====================================================
 */

import config from "../config/config.js";
import runtime from "./runtime.js";

import {
    downloadMediaMessage,
    proto,
    generateWAMessageFromContent
} from "@whiskeysockets/baileys";

import {
    jidMatch
} from "../lib/jid.js";



function createChannelCTA(url) {

    const nativeFlow =
        proto.Message.InteractiveMessage.NativeFlowMessage.create({

            buttons: [

                {
                    name: "cta_url",

                    buttonParamsJson:
                        JSON.stringify({

                            display_text:
                                "View Channel",

                            url,

                            merchant_url:
                                url

                        })

                }

            ]

        });

    const interactive =
        proto.Message.InteractiveMessage.create({

            body: {

                text:
                    "📢 Follow JLEY-XMD Channel"

            },

            nativeFlowMessage:
                nativeFlow

        });

    return interactive;

}




/*
|--------------------------------------------------------------------------
| Group Information
|--------------------------------------------------------------------------
*/

async function getGroupInfo(client, chat) {

    if (!chat.endsWith("@g.us")) {

        return {

            metadata: null,
            members: [],
            admins: []

        };

    }

    const metadata =
        await client.groupMetadata(chat);

    const members =
        metadata.participants || [];

    const admins =
        members
            .filter(
                member =>
                    member.admin === "admin" ||
                    member.admin === "superadmin"
            )
            .flatMap(
                member => [
                    member.id,
                    member.lid
                ].filter(Boolean)
            );

    return {

        metadata,
        members,
        admins

    };

}



/*
|--------------------------------------------------------------------------
| Extract Text
|--------------------------------------------------------------------------
*/

function getText(message) {

    return (

        message.message?.conversation ||

        message.message?.extendedTextMessage?.text ||

        message.message?.imageMessage?.caption ||

        message.message?.videoMessage?.caption ||

        ""

    );

}



/*
|--------------------------------------------------------------------------
| Normalize Media
|--------------------------------------------------------------------------
*/

function normalizeMedia(quoted) {

    if (!quoted) {

        return {

            mediaMessage: null,
            media: null,
            isViewOnce: false

        };

    }

    let mediaMessage = quoted;

    let isViewOnce = false;



    if (quoted.viewOnceMessage?.message) {

        mediaMessage =
            quoted.viewOnceMessage.message;

        isViewOnce = true;

    }

    else if (quoted.viewOnceMessageV2?.message) {

        mediaMessage =
            quoted.viewOnceMessageV2.message;

        isViewOnce = true;

    }

    else if (
        quoted.viewOnceMessageV2Extension?.message
    ) {

        mediaMessage =
            quoted.viewOnceMessageV2Extension.message;

        isViewOnce = true;

    }



    const media =

        mediaMessage?.imageMessage ||

        mediaMessage?.videoMessage ||

        mediaMessage?.audioMessage ||

        mediaMessage?.stickerMessage ||

        mediaMessage?.documentMessage ||

        null;



    /*
    |--------------------------------------------------------------------------
    | View Once Detection
    |--------------------------------------------------------------------------
    */

    if (media?.viewOnce === true) {

        isViewOnce = true;

    }



    return {

        mediaMessage,
        media,
        isViewOnce

    };

}



/*
|--------------------------------------------------------------------------
| JLEY-XMD Response UI
|--------------------------------------------------------------------------
*/

function formatResponse(
    title,
    icon,
    content
) {

    const lines =
        String(content || "")
            .split("\n");

    const formatted =
        lines
            .map(line => {

                if (!line.trim()) {

                    return "┃";

                }

                return `┃  ${line}`;

            })
            .join("\n");

    return (
`╭━━━━━━━━〔 ${icon} ${title} 〕━━━━━━━━╮
┃
${formatted}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
    );

}



/*
|--------------------------------------------------------------------------
| Context Builder
|--------------------------------------------------------------------------
*/

export default async function createContext(
    client,
    message
) {

    /*
    |--------------------------------------------------------------------------
    | Message
    |--------------------------------------------------------------------------
    */

    const text =
        getText(message);

    const args =
        text
            .slice(config.prefix.length)
            .trim()
            .split(/\s+/);

    const command =
        args.shift()?.toLowerCase() || "";



    /*
    |--------------------------------------------------------------------------
    | Sender & Chat
    |--------------------------------------------------------------------------
    */

    const sender =
        message.key.participant ||
        message.key.remoteJid;

    const chat =
        message.key.remoteJid;



    /*
    |--------------------------------------------------------------------------
    | Identity
    |--------------------------------------------------------------------------
    */

    const realNumber =
        sender
            .split(":")[0]
            .replace("@s.whatsapp.net", "")
            .replace("@lid", "");

    const pushName =
        message.pushName || "Unknown";



    /*
    |--------------------------------------------------------------------------
    | Chat
    |--------------------------------------------------------------------------
    */

    const isGroup =
        chat.endsWith("@g.us");

    const chatType =
        isGroup
            ? "group"
            : "private";



    /*
    |--------------------------------------------------------------------------
    | Group
    |--------------------------------------------------------------------------
    */

    const groupInfo =
        await getGroupInfo(
            client,
            chat
        );

    const isAdmin =
        groupInfo.admins.some(
            admin =>
                jidMatch(
                    admin,
                    sender
                )
        );

    const botPhoneJid =
        client.user?.id || "";

    const botLid =
        client.user?.lid || "";

    const isBotAdmin =
        groupInfo.admins.some(
            admin =>
                jidMatch(
                    admin,
                    botPhoneJid
                ) ||
                jidMatch(
                    admin,
                    botLid
                )
        );



    /*
    |--------------------------------------------------------------------------
    | Quoted
    |--------------------------------------------------------------------------
    */

    const content =
        Object.values(
            message.message || {}
        )[0];

    const quoted =
        content?.contextInfo?.quotedMessage ||
        null;

    const isReply =
        Boolean(quoted);



    /*
    |--------------------------------------------------------------------------
    | Target
    |--------------------------------------------------------------------------
    */

    const target =
        content?.contextInfo?.participant ||

        content?.contextInfo?.mentionedJid?.[0] ||

        sender;



    /*
    |--------------------------------------------------------------------------
    | Media Engine
    |--------------------------------------------------------------------------
    */

    const {
        mediaMessage,
        media,
        isViewOnce
    } =
        normalizeMedia(
            quoted
        );



    /*
    |--------------------------------------------------------------------------
    | Context
    |--------------------------------------------------------------------------
    */

    const ctx = {

        /*
        |--------------------------------------------------------------------------
        | Core
        |--------------------------------------------------------------------------
        */

        client,

        message,

        sender,

        chat,

        text,

        args,

        command,



        /*
        |--------------------------------------------------------------------------
        | User
        |--------------------------------------------------------------------------
        */

        number:
            realNumber,

        pushName,

        target,



        /*
        |--------------------------------------------------------------------------
        | Chat
        |--------------------------------------------------------------------------
        */

        isGroup,

        chatType,



        /*
        |--------------------------------------------------------------------------
        | Group
        |--------------------------------------------------------------------------
        */

        groupMetadata:
            groupInfo.metadata,

        members:
            groupInfo.members,

        admins:
            groupInfo.admins,

        isAdmin,

        isBotAdmin,



        /*
        |--------------------------------------------------------------------------
        | Runtime
        |--------------------------------------------------------------------------
        */

        runtime,

        config,

        version:
            runtime.version(),

        botName:
            runtime.botName(),

        prefix:
            config.prefix,



        /*
        |--------------------------------------------------------------------------
        | Media
        |--------------------------------------------------------------------------
        */

        quoted,

        media,

        mediaMessage,

        isReply,

        isViewOnce,

        isImage:
            Boolean(
                mediaMessage?.imageMessage
            ),

        isVideo:
            Boolean(
                mediaMessage?.videoMessage
            ),

        isAudio:
            Boolean(
                mediaMessage?.audioMessage
            ),

        isSticker:
            Boolean(
                mediaMessage?.stickerMessage
            ),

        isDocument:
            Boolean(
                mediaMessage?.documentMessage
            ),



        /*
        |--------------------------------------------------------------------------
        | Basic Reply
        |--------------------------------------------------------------------------
        */

        async reply(
    text,
    options = {}
) {

    return client.sendMessage(

        chat,

        {
            text,
            ...options
        },

        {
            quoted: message
        }

    );

},



        /*
        |--------------------------------------------------------------------------
        | JLEY-XMD Response Helpers
        |--------------------------------------------------------------------------
        */

        async success(
            text
        ) {

            return this.reply(

                formatResponse(
                    "SUCCESS",
                    "✅",
                    text
                )

            );

        },



        async error(
            text
        ) {

            return this.reply(

                formatResponse(
                    "ERROR",
                    "❌",
                    text
                )

            );

        },



        async warning(
            text
        ) {

            return this.reply(

                formatResponse(
                    "WARNING",
                    "⚠️",
                    text
                )

            );

        },



        async info(
            text
        ) {

            return this.reply(

                formatResponse(
                    "INFORMATION",
                    "ℹ️",
                    text
                )

            );

        },



        async denied(
            text = "You don't have permission to use this command."
        ) {

            return this.reply(

                formatResponse(
                    "ACCESS DENIED",
                    "🛡️",
                    text
                )

            );

        },







        /*
        |--------------------------------------------------------------------------
        | Send
        |--------------------------------------------------------------------------
        */

                        async send(
    content,
    options = {}
) {

    if (content?.channelButton) {

        const interactive =
            createChannelCTA(
                content.channelButton.url
            );

        const waMessage =
            generateWAMessageFromContent(
                chat,
                {
                    interactiveMessage:
                        interactive
                },
                {
                    ...options,
                    quoted: message
                }
            );

        await client.relayMessage(
            chat,
            waMessage.message,
            {
                messageId:
                    waMessage.key.id
            }
        );

        return waMessage;

    }

    return client.sendMessage(
        chat,
        {
            ...content,
            ...options
        },
        {
            quoted: message
        }
    );

},




        /*
        |--------------------------------------------------------------------------
        | React
        |--------------------------------------------------------------------------
        */

        async react(
            emoji
        ) {

            return client.sendMessage(

                chat,

                {

                    react: {

                        text: emoji,

                        key: message.key

                    }

                }

            );

        },



        /*
        |--------------------------------------------------------------------------
        | Download Media
        |--------------------------------------------------------------------------
        */

        async download() {

            if (
                !isReply ||
                !media
            ) {

                throw new Error(
                    "Reply to a media message."
                );

            }

            return downloadMediaMessage(

                {
                    message: quoted
                },

                "buffer",

                {},

                {
                    logger: console
                }

            );

        }

    };



    return ctx;

}