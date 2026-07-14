/**
 * JID Utilities
 * Handles WhatsApp JID formats
 */


export function normalizeJid(jid) {

    if (!jid) return "";

    return jid
        .split(":")[0]
        .trim();

}


export function jidMatch(a, b) {

    return normalizeJid(a) === normalizeJid(b);

}