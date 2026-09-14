/**
 * JLEY-XMD Message Context
 *
 * Builds the normalized command context used by plugins.
 *
 * IMPORTANT:
 *
 * WhatsApp may provide:
 *
 * - participant JID
 * - participantAlt / LID
 *
 * Never assume an arbitrary LID can be converted
 * into a phone number.
 */

import config from "../config/config.js";

import {
    jidMatch,
    getNumberFromJid
} from "../lib/jid.js";


function unique(values = []) {

    return [
        ...new Set(
            values
                .filter(Boolean)
                .map(String)
        )
    ];

}


function getSenderIdentities(
    message
) {

    return unique([

        message?.key?.participantAlt,

        message?.key?.participant

    ]);

}


function getGroupParticipantIds(
    participant
) {

    return unique([

        participant?.id,

        participant?.lid

    ]);

}


function findParticipant(
    metadata,
    identities
) {

    if (!metadata?.participants) {
        return null;
    }

    return metadata.participants.find(
        participant => {

            const participantIds =
                getGroupParticipantIds(
                    participant
                );

            return participantIds.some(
                participantId =>
                    identities.some(
                        identity =>
                            jidMatch(
                                participantId,
                                identity
                            )
                    )
            );

        }
    ) || null;

}


function isParticipantAdmin(
    participant
) {

    if (!participant) {
        return false;
    }

    return (
        participant.admin === "admin" ||
        participant.admin === "superadmin"
    );

}


function getBotIdentities(
    client
) {

    return unique([

        client?.user?.id,

        client?.user?.lid

    ]);

}


function isBotAdminInGroup(
    metadata,
    botIdentities
) {

    if (!metadata?.participants) {
        return false;
    }

    const botParticipant =
        metadata.participants.find(
            participant => {

                const participantIds =
                    getGroupParticipantIds(
                        participant
                    );

                return participantIds.some(
                    participantId =>
                        botIdentities.some(
                            botIdentity =>
                                jidMatch(
                                    participantId,
                                    botIdentity
                                )
                        )
                );

            }
        );

    return isParticipantAdmin(
        botParticipant
    );

}


/**
 * Resolve a phone number ONLY when WhatsApp
 * actually supplied a phone JID.
 *
 * We never manufacture a phone number from
 * an arbitrary LID.
 */
function resolvePhoneNumber(
    identities
) {

    for (const identity of identities) {

        if (
            identity.endsWith(
                "@s.whatsapp.net"
            )
        ) {

            return getNumberFromJid(
                identity
            );

        }

    }

    return "";

}


/**
 * Build the command context.
 */
export async function createContext(
    client,
    message
) {

    const remoteJid =
        message?.key?.remoteJid || "";

    if (!remoteJid) {
        return null;
    }


    const senderIdentities =
        getSenderIdentities(
            message
        );


    const sender =
        senderIdentities[0] ||
        remoteJid;


    const senderAlt =
        senderIdentities[1] ||
        "";


    const chat =
        remoteJid;


    const isGroup =
        chat.endsWith(
            "@g.us"
        );


    let metadata = null;


    if (isGroup) {

        try {

            metadata =
                await client.groupMetadata(
                    chat
                );

        } catch (error) {

            console.error(
                "Group metadata error:",
                error.message
            );

        }

    }


    const senderParticipant =
        findParticipant(
            metadata,
            senderIdentities
        );


    const isAdmin =
        isParticipantAdmin(
            senderParticipant
        );


    const botIdentities =
        getBotIdentities(
            client
        );


    const isBotAdmin =
        isGroup
            ? isBotAdminInGroup(
                metadata,
                botIdentities
            )
            : false;


    const pushName =
        message?.pushName ||
        senderParticipant?.notify ||
        senderParticipant?.name ||
        "User";


    const realNumber =
        resolvePhoneNumber(
            senderIdentities
        );


    /*
     * Media detection.
     */
    const messageContent =
        message?.message || {};

    const imageMessage =
        messageContent?.imageMessage ||
        null;

    const videoMessage =
        messageContent?.videoMessage ||
        null;

    const documentMessage =
        messageContent?.documentMessage ||
        null;

    const audioMessage =
        messageContent?.audioMessage ||
        null;


    const isImage =
        Boolean(imageMessage);

    const isVideo =
        Boolean(videoMessage);

    const isDocument =
        Boolean(documentMessage);

    const isAudio =
        Boolean(audioMessage);


    /*
     * Reply detection.
     */
    const contextInfo =
        imageMessage?.contextInfo ||
        videoMessage?.contextInfo ||
        documentMessage?.contextInfo ||
        audioMessage?.contextInfo ||
        messageContent?.extendedTextMessage?.contextInfo ||
        messageContent?.textMessage?.contextInfo ||
        null;


    const quotedMessage =
        contextInfo?.quotedMessage ||
        null;


    const isReply =
        Boolean(quotedMessage);


    /*
     * Prefix.
     */
    const prefix =
        config.prefix ||
        ".";


    /*
     * Context object.
     */
    const ctx = {

        client,

        message,

        deploymentId:
            client?.deploymentId ||
            "",


        /*
         * Chat identity.
         */
        chat,

        remoteJid:
            chat,


        /*
         * Sender identities.
         *
         * sender:
         * primary identity supplied by WhatsApp.
         *
         * senderAlt:
         * alternate identity, normally LID.
         */
        sender,

        senderAlt,

        senderIdentities,


        /*
         * Human-readable information.
         */
        pushName,

        number:
            realNumber,


        /*
         * Chat type.
         */
        isGroup,


        /*
         * Group permissions.
         */
        isAdmin,

        isBotAdmin,

        groupMetadata:
            metadata,


        /*
         * Bot identities.
         */
        botIdentities,


        /*
         * Prefix.
         */
        prefix,

        prefixChar:
            prefix,


        /*
         * Media.
         */
        isImage,

        isVideo,

        isDocument,

        isAudio,


        /*
         * Reply / quoted message.
         */
        isReply,

        quotedMessage,


        /*
         * Convenience aliases.
         */
        quoted:
            quotedMessage,


        /*
         * Reply helper.
         *
         * Channel metadata is intentionally preserved.
         */
        reply:
            async (
                text,
                options = {}
            ) => {

                const channelInfo = {

                    forwardedNewsletterMessageInfo: {

                        newsletterJid:
                            config.channel?.inviteCode
                                ? `120363${config.channel.inviteCode}@newsletter`
                                : undefined,

                        serverMessageId:
                            1,

                        newsletterName:
                            config.channel?.name ||
                            "JLEY-XMD"

                    }

                };


                return client.sendMessage(

                    chat,

                    {

                        text,

                        ...channelInfo,

                        ...options

                    }

                );

            },


        /*
         * Generic send helper.
         *
         * Channel metadata is intentionally preserved.
         */
        send:
            async (
                content,
                options = {}
            ) => {

                const channelInfo = {

                    forwardedNewsletterMessageInfo: {

                        newsletterJid:
                            config.channel?.inviteCode
                                ? `120363${config.channel.inviteCode}@newsletter`
                                : undefined,

                        serverMessageId:
                            1,

                        newsletterName:
                            config.channel?.name ||
                            "JLEY-XMD"

                    }

                };


                if (
                    typeof content === "string"
                ) {

                    return client.sendMessage(

                        chat,

                        {

                            text:
                                content,

                            ...channelInfo,

                            ...options

                        }

                    );

                }


                return client.sendMessage(

                    chat,

                    {

                        ...content,

                        ...channelInfo,

                        ...options

                    }

                );

            },


        /*
         * Download replied/current media.
         */
        download:
            async () => {

                const target =
                    quotedMessage
                        ? {
                            key: {
                                remoteJid:
                                    chat,

                                fromMe:
                                    false,

                                id:
                                    contextInfo?.stanzaId,

                                participant:
                                    contextInfo?.participant
                            },

                            message:
                                quotedMessage

                        }
                        : message;


                if (!target?.message) {

                    throw new Error(
                        "No downloadable media found."
                    );

                }


                const {
                    downloadContentFromMessage
                } = await import(
                    "@whiskeysockets/baileys"
                );


                let mediaMessage =
                    target.message?.imageMessage ||
                    target.message?.videoMessage ||
                    target.message?.audioMessage ||
                    target.message?.documentMessage;


                let mediaType =
                    target.message?.imageMessage
                        ? "image"
                        : target.message?.videoMessage
                            ? "video"
                            : target.message?.audioMessage
                                ? "audio"
                                : target.message?.documentMessage
                                    ? "document"
                                    : null;


                if (
                    !mediaMessage ||
                    !mediaType
                ) {

                    throw new Error(
                        "Message does not contain downloadable media."
                    );

                }


                const stream =
                    await downloadContentFromMessage(
                        mediaMessage,
                        mediaType
                    );


                const chunks = [];


                for await (
                    const chunk of stream
                ) {

                    chunks.push(
                        chunk
                    );

                }


                return Buffer.concat(
                    chunks
                );

            }

    };


    return ctx;

}


export default createContext;