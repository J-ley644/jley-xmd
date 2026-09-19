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

import {
    resolvePhoneNumber
} from "./identity.js";


const channelMetadataPromises =
    new WeakMap();


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


async function addChannelPreview(
    client,
    content = {}
) {

    if (
        !content ||
        typeof content !== "object"
    ) {
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


async function getGroupInfo(
    client,
    chat
) {

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


/**
 * Normalize View Once messages.
 *
 * WhatsApp can represent View Once media in
 * several different structures depending on
 * message/version:
 *
 * - viewOnceMessage
 * - viewOnceMessageV2
 * - viewOnceMessageV2Extension
 * - imageMessage.viewOnce
 * - videoMessage.viewOnce
 */
function unwrapViewOnceMessage(message) {

    if (!message) {
        return null;
    }

    return (

        message?.viewOnceMessage?.message ||

        message?.viewOnceMessageV2?.message ||

        message?.viewOnceMessageV2Extension?.message ||

        message

    );

}


export default async function createContext(
    client,
    message
) {

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
     */

    const isGroup =
        message.key?.remoteJid?.endsWith("@g.us");


    const sender =
        message.key?.fromMe
            ? (
                client.user?.id ||
                client.user?.lid ||
                message.key?.remoteJid
            )
            : isGroup
                ? (
                    message.key?.participant ||
                    message.key?.participantAlt ||
                    message.key?.remoteJid
                )
                : (
                    message.key?.remoteJid ||
                    message.key?.remoteJidAlt ||
                    message.key?.participant ||
                    message.key?.participantAlt
                );


    const senderAlt =
        isGroup
            ? (
                message.key?.participantAlt ||
                message.key?.participant ||
                message.key?.remoteJid
            )
            : (
                message.key?.remoteJidAlt ||
                message.key?.remoteJid ||
                message.key?.participant ||
                message.key?.participantAlt ||
                ""
            );


    const chat =
        message.key.remoteJid;


    async function resolveSenderPhoneNumber(
        client,
        sender,
        senderAlt
    ) {

        const direct =
            resolvePhoneNumber({
                sender,
                senderAlt,
                client
            });

        if (direct) {
            return direct;
        }

        const identities = [
            sender,
            senderAlt
        ].filter(Boolean);

        const lid =
            identities.find(identity =>
                String(identity).endsWith("@lid")
            );

        if (!lid) {
            return "";
        }

        try {

            const getPNForLID =
                client
                    ?.signalRepository
                    ?.lidMapping
                    ?.getPNForLID;

            if (
                typeof getPNForLID !== "function"
            ) {
                return "";
            }

            const pn =
                await getPNForLID.call(
                    client.signalRepository.lidMapping,
                    lid
                );

            return pn
                ? String(pn).replace(/\D/g, "")
                : "";

        } catch (error) {

            console.error(
                "[IDENTITY] Failed to resolve LID to phone:",
                error.message
            );

            return "";

        }

    }


    // Identity

    const realNumber =
        await resolveSenderPhoneNumber(
            client,
            sender,
            senderAlt
        );


    console.log({
        sender,
        senderAlt,
        realNumber
    });


    const pushName =
        message.pushName ||
        "Unknown";


    // Chat

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
     * This preserves LID/PN-compatible admin detection.
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


    /*
     * Media normalization.
     *
     * For normal media, mediaMessage === quoted.
     *
     * For View Once media, mediaMessage becomes
     * the inner message containing imageMessage/videoMessage.
     */

    const mediaMessage =
        unwrapViewOnceMessage(
            quoted
        );


    const media =
        mediaMessage?.imageMessage ||

        mediaMessage?.videoMessage ||

        mediaMessage?.audioMessage ||

        mediaMessage?.stickerMessage ||

        mediaMessage?.documentMessage ||

        null;


    const isViewOnce =
        Boolean(

            quoted?.viewOnceMessage ||

            quoted?.viewOnceMessageV2 ||

            quoted?.viewOnceMessageV2Extension ||

            media?.viewOnce === true

        );


    const ctx = {

        // Core

        client,

        message,

        sender,

        senderAlt,

        chat,

        text,

        args,

        command,


        // User

        number:
            realNumber,

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


        // Helpers

        async reply(
            text,
            options = {}
        ) {

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

                finalOptions,

                {
                    quoted: message
                }

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

                finalContent,

                {
                    quoted: message
                }

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

            if (
                !isReply ||
                !media
            ) {

                throw new Error(
                    "Reply to a media message."
                );

            }

            /*
             * Use the normalized message so
             * View Once wrappers can also be
             * downloaded correctly.
             */

            return downloadMediaMessage(

                {
                    message: mediaMessage
                },

                "buffer",

                {},

                {}

            );

        },


        async downloadBuffer() {

            return this.download();

        },


        async error(text) {

            return this.reply(
                `❌ ${text}`
            );

        }

    };


    return ctx;

}