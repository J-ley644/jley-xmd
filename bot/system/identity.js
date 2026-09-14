/**
 * JLEY-XMD Identity System
 *
 * Centralizes:
 *
 * - sender identity
 * - alternate/LID identity
 * - bot identity
 * - deployment owner identity
 * - JLEY developer identity
 *
 * IMPORTANT:
 *
 * A dashboard user ID is NOT a WhatsApp JID.
 *
 * Therefore deployment ownership is resolved through
 * the WhatsApp phone number stored on the deployment.
 *
 * Never assume a phone JID and a LID are numerically
 * related. They must be compared only when WhatsApp
 * provides both identities.
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


/**
 * Get every identity WhatsApp supplied for
 * the current message sender.
 *
 * In groups this can include:
 *
 * - participant JID
 * - participant LID
 */
export function getSenderIdentities(ctx) {

    return unique([
        ctx?.sender,
        ctx?.senderAlt
    ]);

}


/**
 * Get every identity belonging to the
 * WhatsApp account running this deployment.
 */
export function getBotIdentities(client) {

    return unique([
        client?.user?.id,
        client?.user?.lid
    ]);

}


/**
 * Get identities belonging to the
 * permanent JLEY developer.
 */
export function getJleyOwnerIdentities() {

    return unique([
        config.owner?.number,
        config.owner?.jid,
        config.owner?.lid
    ]);

}


/**
 * Get identities belonging to the
 * owner of the current deployment.
 *
 * The deployment phone number is attached
 * to the running socket by the WhatsApp
 * deployment service.
 */
export function getDeploymentOwnerIdentities(ctx) {

    const client =
        ctx?.client;

    return unique([
        client?.deploymentOwnerPhoneNumber,
        client?.deploymentOwnerJid,
        client?.deploymentOwnerLid
    ]);

}


/**
 * Compare two collections of identities.
 *
 * We intentionally use jidMatch() rather than
 * trying to convert a LID into a phone number.
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
 * Determine whether the current sender
 * is the permanent JLEY developer.
 */
export function isJleyOwnerIdentity(ctx) {

    return identitiesMatch(
        getSenderIdentities(ctx),
        getJleyOwnerIdentities()
    );

}


/**
 * Determine whether the current sender
 * is the owner of this deployment.
 *
 * This works regardless of whether the
 * message arrives in:
 *
 * - private DM
 * - group
 * - another chat
 *
 * provided WhatsApp gives us the owner's
 * matching identity.
 */
export function isDeploymentOwner(ctx) {

    return identitiesMatch(
        getSenderIdentities(ctx),
        getDeploymentOwnerIdentities(ctx)
    );

}


/**
 * Determine whether the current sender
 * is the WhatsApp account running the bot.
 *
 * This is kept separately from deployment
 * ownership because these are different concepts.
 */
export function isBotAccount(ctx) {

    return identitiesMatch(
        getSenderIdentities(ctx),
        getBotIdentities(ctx?.client)
    );

}


/**
 * Resolve the best available phone number
 * without inventing a phone number from
 * an arbitrary LID.
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
 * Build a complete diagnostic identity object.
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

        deploymentOwnerIdentities:
            getDeploymentOwnerIdentities(
                ctx
            ),

        jleyOwnerIdentities:
            getJleyOwnerIdentities(),

        phoneNumber:
            resolvePhoneNumber(ctx),

        isJleyOwner:
            isJleyOwnerIdentity(ctx),

        isDeploymentOwner:
            isDeploymentOwner(ctx),

        isBotAccount:
            isBotAccount(ctx)

    };

}