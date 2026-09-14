/**
 * JLEY-XMD Identity System
 *
 * Centralizes:
 *
 * - sender identity
 * - alternate/LID identity
 * - bot identity
 * - JLEY developer identity
 * - deployment owner identity
 *
 * Never assume that a phone JID and a LID are numerically related.
 */

import config from "../config/config.js";
import { jidMatch, getNumberFromJid } from "../lib/jid.js";


function unique(values = []) {

    return [
        ...new Set(
            values
                .filter(Boolean)
                .map(String)
        )
    ];

}


/**
 * Get all identities WhatsApp gave us for the sender.
 */
export function getSenderIdentities(ctx) {

    return unique([
        ctx?.sender,
        ctx?.senderAlt
    ]);

}


/**
 * Get all identities belonging to the running bot.
 */
export function getBotIdentities(client) {

    return unique([
        client?.user?.id,
        client?.user?.lid
    ]);

}


/**
 * Get JLEY developer identities.
 */
export function getJleyOwnerIdentities() {

    return unique([
        config.owner?.number,
        config.owner?.jid,
        config.owner?.lid
    ]);

}


/**
 * Compare two identity collections.
 */
export function identitiesMatch(
    identitiesA = [],
    identitiesB = []
) {

    return identitiesA.some(a =>
        identitiesB.some(b =>
            jidMatch(a, b)
        )
    );

}


/**
 * Determine whether the message sender
 * is the permanent JLEY developer.
 */
export function isJleyOwnerIdentity(ctx) {

    return identitiesMatch(
        getSenderIdentities(ctx),
        getJleyOwnerIdentities()
    );

}


/**
 * Determine whether the message sender
 * is the WhatsApp account running this bot.
 */
export function isBotAccount(ctx) {

    return identitiesMatch(
        getSenderIdentities(ctx),
        getBotIdentities(ctx?.client)
    );

}


/**
 * Resolve the best available phone number
 * without inventing one for LIDs.
 */
export function resolvePhoneNumber(ctx) {

    const identities =
        getSenderIdentities(ctx);

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
 * Build a diagnostic identity object.
 */
export function getIdentityInfo(ctx) {

    return {

        sender:
            ctx?.sender || "",

        senderAlt:
            ctx?.senderAlt || "",

        senderIdentities:
            getSenderIdentities(ctx),

        botIdentities:
            getBotIdentities(
                ctx?.client
            ),

        jleyOwnerIdentities:
            getJleyOwnerIdentities(),

        phoneNumber:
            resolvePhoneNumber(ctx),

        isJleyOwner:
            isJleyOwnerIdentity(ctx),

        isBotAccount:
            isBotAccount(ctx)

    };

}