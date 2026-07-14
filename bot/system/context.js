/**
 * JLEY-XMD Context Builder
 * Context API v3
 * Core + Media + Group Foundation
 */

import config from "../config/config.js";
import runtime from "./runtime.js";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import {
    jidMatch
} from "../lib/jid.js";



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
        .map(
            member => member.id
        );



    return {

        metadata,

        members,

        admins

    };


}




function getText(message) {


    return (

        message.message?.conversation ||

        message.message?.extendedTextMessage?.text ||

        message.message?.imageMessage?.caption ||

        message.message?.videoMessage?.caption ||

        ""

    );


}




export default async function createContext(client, message) {


    const text =
        getText(message);



    const args =
        text
        .slice(config.prefix.length)
        .trim()
        .split(/\s+/);



    const command =
        args.shift()?.toLowerCase() || "";



    const sender =
        message.key.participant ||
        message.key.remoteJid;



    const chat =
        message.key.remoteJid;




    // Identity

    const number =
        sender.split("@")[0];



    const pushName =
        message.pushName ||
        "Unknown";





    // Chat

    const isGroup =
        chat.endsWith("@g.us");



    const chatType =
        isGroup
        ? "group"
        : "private";





    // Group foundation

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
        client.user.id;



    const botLid =
        client.authState?.creds?.me?.lid;



    const isBotAdmin =
        groupInfo.admins.some(
            admin =>
                jidMatch(
                    admin,
                    botPhoneJid
                )
                ||
                jidMatch(
                    admin,
                    botLid
                )
        );





    // Quoted message

    const quoted =
        message.message
        ?.extendedTextMessage
        ?.contextInfo
        ?.quotedMessage ||
        null;



    const isReply =
        Boolean(quoted);





    // Media

    const media =
        quoted?.imageMessage ||

        quoted?.videoMessage ||

        quoted?.audioMessage ||

        quoted?.stickerMessage ||

        quoted?.documentMessage ||

        null;





    const ctx = {



        // Core

        client,

        message,

        sender,

        chat,

        text,

        args,

        command,





        // User

        number,

        pushName,





        // Chat

        isGroup,

        chatType,





        // Group

        groupMetadata:
            groupInfo.metadata,


        members:
            groupInfo.members,


        admins:
            groupInfo.admins,


        isAdmin,


        isBotAdmin,





        // Runtime

        runtime,


        version:
            runtime.version(),


        botName:
            runtime.botName(),


        prefix:
            config.prefix,





        // Media

        quoted,


        media,


        isReply,


        isImage:
            Boolean(quoted?.imageMessage),


        isVideo:
            Boolean(quoted?.videoMessage),


        isAudio:
            Boolean(quoted?.audioMessage),


        isSticker:
            Boolean(quoted?.stickerMessage),


        isDocument:
            Boolean(quoted?.documentMessage),





        // Helpers


        async reply(text) {


            return client.sendMessage(

                chat,

                {
                    text
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

                {}

            );


        }



    };



    return ctx;


}