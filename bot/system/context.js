/**
 * =====================================================
 * JLEY-XMD Context Builder
 * Context API v4
 *
 * Core
 * User
 * Group
 * Runtime
 * Media Engine
 * Helper API
 * =====================================================
 */

import config from "../config/config.js";
import runtime from "./runtime.js";

import {
    downloadMediaMessage
} from "@whiskeysockets/baileys";

import {
    jidMatch
} from "../lib/jid.js";



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
|
| Handles:
|
| ✔ Normal Media
| ✔ View Once
| ✔ Future Wrappers
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



    return {

        mediaMessage,

        media,

        isViewOnce

    };

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
                jidMatch(admin, botPhoneJid) ||
                jidMatch(admin, botLid)
        );



    /*
    |--------------------------------------------------------------------------
    | Quoted
    |--------------------------------------------------------------------------
    */

    const quoted =
        message.message
            ?.extendedTextMessage
            ?.contextInfo
            ?.quotedMessage ||
        null;

    const isReply =
        Boolean(quoted);



    /*
    |--------------------------------------------------------------------------
    | Target
    |--------------------------------------------------------------------------
    */

    const target =

        message.message
            ?.extendedTextMessage
            ?.contextInfo
            ?.participant ||

        message.message
            ?.extendedTextMessage
            ?.contextInfo
            ?.mentionedJid?.[0] ||

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

    } = normalizeMedia(
        quoted
    );





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

        number: realNumber,

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
        | Helpers
        |--------------------------------------------------------------------------
        */

        async reply(text, options = {}) {

            return client.sendMessage(

                chat,

                {

                    text,

                    ...options

                }

            );

        },



        async send(content) {

            return client.sendMessage(

                chat,

                content

            );

        },



        async react(emoji) {

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

            if (!isReply || !media) {

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