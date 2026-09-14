/**
 * JLEY-XMD Identity System
 *
 * Owner identity:
 * deployment.phoneNumber
 *
 * Developer identity:
 * config.owner.number
 *
 * LIDs are supplementary identities only.
 * They must never be used as a replacement
 * for the deployment owner's phone number.
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
 * Get every identity WhatsApp supplied
 * for the current sender.
 */
export function getSenderIdentities(ctx) {

    return unique([
        ctx?.sender,
        ctx?.senderAlt
    ]);

}


/**
 * Get every identity belonging to
 * the WhatsApp account running this bot.
 */
export function getBotIdentities(client) {

    return unique([
        client?.user?.id,
        client?.user?.lid
    ]);

}


/**
 * Get the permanent JLEY developer identities.
 *
 * The developer is identified by the
 * configured JLEY owner number.
 */
export function getJleyOwnerIdentities() {

    return unique([
        config.owner?.number,
        config.owner?.jid,
        config.owner?.lid
    ]);

}


/**
 * Get the deployment owner's phone number.
 *
 * The deployment phone number is the
 * authoritative owner identity.
 */
export function getDeploymentOwnerIdentities(ctx) {

    const client =
        ctx?.client;

    return unique([
        client?.deploymentOwnerPhoneNumber
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
 * Resolve the sender's real phone number.
 *
 * WhatsApp may provide:
 *
 * - normal phone JID
 * - LID
 * - alternate phone JID
 *
 * We only accept an actual
 * @s.whatsapp.net identity as the
 * authoritative phone number.
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
 * Determine whether the sender
 * is the permanent JLEY developer.
 *
 * Developer identity is based on
 * the configured JLEY phone number.
 */
export function isJleyOwnerIdentity(ctx) {

    const senderNumber =
        resolvePhoneNumber(ctx);

    const developerNumber =
        String(
            config.owner?.number || ""
        )
            .replace(/\D/g, "");

    if (
        !senderNumber ||
        !developerNumber
    ) {

        return false;

    }

    return (
        senderNumber ===
        developerNumber
    );

}


/**
 * Determine whether the sender
 * owns this deployment.
 *
 * IMPORTANT:
 *
 * Deployment ownership is determined by:
 *
 *     sender phone number
 *              ↓
 *     deployment.phoneNumber
 *
 * It does NOT depend on:
 *
 * - LID matching
 * - bot account identity
 * - dashboard user UUID
 */
export function isDeploymentOwner(ctx) {

    const senderNumber =
        resolvePhoneNumber(ctx);

    const deploymentNumber =
        String(
            ctx?.client
                ?.deploymentOwnerPhoneNumber ||
            ""
        )
            .replace(/\D/g, "");

    if (
        !senderNumber ||
        !deploymentNumber
    ) {

        return false;

    }

    return (
        senderNumber ===
        deploymentNumber
    );

}


/**
 * Determine whether the sender
 * is the WhatsApp account running
 * the bot.
 */
export function isBotAccount(ctx) {

    return identitiesMatch(
        getSenderIdentities(ctx),
        getBotIdentities(
            ctx?.client
        )
    );

}


/**
 * Complete identity diagnostic.
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