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


export function getSenderIdentities(ctx) {

    return unique([
        ctx?.sender,
        ctx?.senderAlt
    ]);

}


export function getBotIdentities(client) {

    return unique([
        client?.user?.id,
        client?.user?.lid
    ]);

}


export function getJleyOwnerIdentities() {

    return unique([
        config.owner?.number,
        config.owner?.jid,
        config.owner?.lid
    ]);

}


/*
 * Deployment owner is the person who paired/deployed
 * this specific WhatsApp bot.
 *
 * First use the deployment owner's stored phone number.
 * Then fall back to the phone number of the WhatsApp
 * account currently linked to this deployment.
 */
export function getDeploymentOwnerIdentities(ctx) {

    const client = ctx?.client;

    const identities = [
        client?.deploymentOwnerPhoneNumber
    ];

    if (client?.user?.id) {

        identities.push(
            getNumberFromJid(
                client.user.id
            )
        );

    }

    return unique(identities);

}


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
 * The normal WhatsApp phone JID is preferred.
 * LID remains available as a secondary identity,
 * but we never pretend that a LID itself is a phone
 * number.
 */
export function resolvePhoneNumber(ctx) {

    const identities =
        getSenderIdentities(ctx);

    for (const identity of identities) {

        if (
            String(identity).endsWith(
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


/*
 * Permanent JLEY developer.
 */
export function isJleyOwnerIdentity(ctx) {

    const senderNumber =
        String(
            resolvePhoneNumber(ctx) || ""
        )
            .replace(/\D/g, "");

    const developerNumber =
        String(
            config.owner?.number || ""
        )
            .replace(/\D/g, "");

    return Boolean(
        senderNumber &&
        developerNumber &&
        senderNumber === developerNumber
    );

}


/*
 * Owner of this specific bot deployment.
 */
export function isDeploymentOwner(ctx) {

    const senderIdentities =
        getSenderIdentities(ctx);

    const deploymentOwnerIdentities =
        getDeploymentOwnerIdentities(ctx);

    if (
        !senderIdentities.length ||
        !deploymentOwnerIdentities.length
    ) {
        return false;
    }

    return identitiesMatch(
        senderIdentities,
        deploymentOwnerIdentities
    );

}


export function isBotAccount(ctx) {

    return identitiesMatch(
        getSenderIdentities(ctx),
        getBotIdentities(
            ctx?.client
        )
    );

}


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
            getDeploymentOwnerIdentities(ctx),

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