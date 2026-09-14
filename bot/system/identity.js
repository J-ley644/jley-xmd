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


export function getDeploymentOwnerIdentities(ctx) {

    const client = ctx?.client;

    const identities = [
        client?.deploymentOwnerPhoneNumber
    ];

    /*
     * The linked WhatsApp account is the authoritative
     * deployment identity when deployment.phoneNumber has
     * not yet been attached to the socket.
     *
     * This also survives socket reconnection.
     */
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


export function isDeploymentOwner(ctx) {

    const senderNumber =
        String(
            resolvePhoneNumber(ctx) || ""
        )
            .replace(/\D/g, "");

    const deploymentNumbers =
        getDeploymentOwnerIdentities(ctx)
            .map(value =>
                String(value)
                    .replace(/\D/g, "")
            )
            .filter(Boolean);

    if (
        !senderNumber ||
        !deploymentNumbers.length
    ) {

        return false;

    }

    return deploymentNumbers.includes(
        senderNumber
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