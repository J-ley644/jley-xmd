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


const channelMetadataPromises = new WeakMap();


async function getChannelMetadata(client) {

    if (
        !config.channel?.inviteCode ||
        !client?.newsletterMetadata
    ) {
        return null;
    }

    if (!channelMetadataPromises.has(client)) {

        const promise =
            client.newsletterMetadata(
                "invite",
                config.channel.inviteCode
            )
            .catch(error => {

                console.error(
                    "[CHANNEL] Failed to load channel metadata:",
                    error
                );

                channelMetadataPromises.delete(client);

                return null;

            });

        channelMetadataPromises.set(
            client,
            promise
        );

    }

    return channelMetadataPromises.get(client);

}


async function addChannelPreview(client, content = {}) {

    if (!content || typeof content !== "object") {
        return content;
    }

    const hasText =
        typeof content.text === "string" ||
        typeof content.caption === "string";

    if (!hasText) {
        return content;
    }

    try {

        const channel =
            await getChannelMetadata(client);

        if (channel?.id) {

            return {

                ...content,

                contextInfo: {

                    ...(content.contextInfo || {}),

                    forwardingScore: 1,

                    isForwarded: true,

                    forwardedNewsletterMessageInfo: {

                        newsletterJid:
                            channel.id,

                        serverMessageId: 1,

                        newsletterName:
                            channel.name ||
                            config.channel?.name ||
                            "JLEY-XMD"

                    }

                }

            };

        }

    } catch (error) {

        console.error(
            "[CHANNEL] Failed to attach channel preview:",
            error
        );

    }

    return content;

}


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
            .flatMap(member => [
                member.id,
                member.lid
            ].filter(Boolean));

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

    /*
     * WhatsApp can identify the sender using either
     * the normal participant JID or an alternate/LID JID.
     *
     * Prefer the alternate identity when available because
     * it can contain the usable phone JID, while still keeping
     * the normal participant identity as a fallback.
     */
    const sender =
        message.key.participantAlt ||
        message.key.participant ||
        message.key.remoteJid;

    const senderAlt =
        message.key.participant ||
        message.key.participantAlt ||
        "";

    const chat =
        message.key.remoteJid;


    // Identity

    const realNumber =
        sender.includes("@lid")
            ? config.owner.number
            : sender
                .split(":")[0]
                .replace("@s.whatsapp.net", "")
                .replace("@lid", "");

    console.log({
        sender,
        senderAlt,
        realNumber
    });


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


    /*
     * Check both sender identities.
     *
     * This fixes admin detection when WhatsApp provides
     * the participant as a LID/alternate identity.
     */
    const isAdmin =
        groupInfo.admins.some(
            admin =>
                jidMatch(
                    admin,
                    sender
                )
                ||
                jidMatch(
                    admin,
                    senderAlt
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


    const target =

        // Reply target
        message.message
            ?.extendedTextMessage
            ?.contextInfo
            ?.participant ||

        // Mention target
        message.message
            ?.extendedTextMessage
            ?.contextInfo
            ?.mentionedJid?.[0] ||

        null;


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

        number: realNumber,

        pushName,

        target,


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

        config,

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

        async reply(text, options = {}) {

            const replyOptions = {

                text,

                ...options

            };

            const finalOptions =
                await addChannelPreview(
                    client,
                    replyOptions
                );

            return client.sendMessage(

                chat,

                finalOptions

            );

        },


        async send(content) {

            const finalContent =
                await addChannelPreview(
                    client,
                    content
                );

            return client.sendMessage(

                chat,

                finalContent

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