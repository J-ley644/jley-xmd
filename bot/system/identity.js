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


function normalizeNumber(value) {
    return String(value || "")
        .replace(/\D/g, "");
}


/*
 * All identities associated with the sender.
 *
 * sender and senderAlt may contain either:
 * - phone JID
 * - LID
 * - alternate WhatsApp identity
 */
export function getSenderIdentities(ctx) {
    return unique([
        ctx?.sender,
        ctx?.senderAlt
    ]);
}


/*
 * Identities belonging to the WhatsApp account
 * running this deployment.
 */
export function getBotIdentities(client) {
    return unique([
        client?.user?.id,
        client?.user?.lid
    ]);
}


/*
 * Permanent JLEY developer identities.
 *
 * These belong to JLEY itself and are independent
 * from any individual bot deployment.
 */
export function getJleyOwnerIdentities() {
    return unique([
        config.owner?.number,
        config.owner?.jid,
        config.owner?.lid
    ]);
}


/*
 * Owner of this specific deployment.
 *
 * The deployment owner's stored phone number is
 * the authoritative ownership identity.
 *
 * We intentionally do NOT use the bot account's
 * own WhatsApp number as an ownership fallback.
 */
export function getDeploymentOwnerIdentities(ctx) {
    const deploymentOwner =
        ctx?.client?.deploymentOwnerPhoneNumber;

    return unique([
        deploymentOwner
    ]);
}


/*
 * Compare WhatsApp JID identities.
 *
 * This is useful for raw JID/LID identity checks,
 * but should not be used to decide deployment
 * ownership when a resolved phone number exists.
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


/*
 * Resolve the sender's real phone number.
 *
 * context.js now performs LID -> phone resolution
 * through WhatsApp's lidMapping and stores the
 * resolved value in ctx.number.
 *
 * Therefore ctx.number is the primary identity
 * used for authorization.
 */
export function resolvePhoneNumber(ctx) {
    const number = normalizeNumber(
        ctx?.number
    );

    if (number) {
        return number;
    }


    /*
     * Fallback for a normal WhatsApp phone JID
     * in case ctx.number has not been populated.
     */
    const identities =
        getSenderIdentities(ctx);

    for (const identity of identities) {
        if (
            String(identity).endsWith(
                "@s.whatsapp.net"
            )
        ) {
            return normalizeNumber(
                getNumberFromJid(identity)
            );
        }
    }

    return "";
}


/*
 * Check whether the sender is the permanent
 * JLEY developer.
 *
 * This is global and is not tied to a deployment.
 */
export function isJleyOwnerIdentity(ctx) {
    const senderNumber =
        resolvePhoneNumber(ctx);

    const developerNumber =
        normalizeNumber(
            config.owner?.number
        );

    return Boolean(
        senderNumber &&
        developerNumber &&
        senderNumber === developerNumber
    );
}


/*
 * Check whether the sender owns this specific
 * bot deployment.
 *
 * Ownership is tied to the deployment's stored
 * phone number, not the bot's own account identity.
 */
export function isDeploymentOwner(ctx) {
    const senderNumber =
        resolvePhoneNumber(ctx);

    const deploymentOwnerNumber =
        normalizeNumber(
            ctx?.client?.deploymentOwnerPhoneNumber
        );

    return Boolean(
        senderNumber &&
        deploymentOwnerNumber &&
        senderNumber === deploymentOwnerNumber
    );
}


/*
 * Check whether the sender is the WhatsApp account
 * running this bot.
 */
export function isBotAccount(ctx) {
    return identitiesMatch(
        getSenderIdentities(ctx),
        getBotIdentities(
            ctx?.client
        )
    );
}


/*
 * Return the complete identity state.
 *
 * Useful for permissions, debugging and future
 * role-based authorization.
 */
export function getIdentityInfo(ctx) {
    return {
        sender:
            ctx?.sender || "",

        senderAlt:
            ctx?.senderAlt || "",

        senderIdentities:
            getSenderIdentities(ctx),

        phoneNumber:
            resolvePhoneNumber(ctx),

        botIdentities:
            getBotIdentities(
                ctx?.client
            ),

        deploymentOwnerIdentities:
            getDeploymentOwnerIdentities(ctx),

        jleyOwnerIdentities:
            getJleyOwnerIdentities(),

        isJleyOwner:
            isJleyOwnerIdentity(ctx),

        isDeploymentOwner:
            isDeploymentOwner(ctx),

        isBotAccount:
            isBotAccount(ctx)
    };
}