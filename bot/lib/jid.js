/**
 * JID Utilities
 * Handles WhatsApp JID formats including LID
 */


export function normalizeJid(jid) {

    if (!jid) return "";

    return jid
        .split(":")[0]
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "")
        .trim();

}



export function jidMatch(a, b) {

    if (!a || !b) return false;


    const jidA = normalizeJid(a);
    const jidB = normalizeJid(b);


    return jidA === jidB;

}



export function getNumberFromJid(jid) {

    if (!jid) return "Unknown";


    return jid
        .split(":")[0]
        .replace("@s.whatsapp.net", "")
        .replace("@lid", "");

}