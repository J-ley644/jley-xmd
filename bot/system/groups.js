/**
 * JLEY-XMD Group Manager
 * Shared helper functions for group commands.
 */

export async function getGroupMetadata(client, jid) {
    try {
        return await client.groupMetadata(jid);
    } catch (error) {
        return null;
    }
}

export function isGroup(jid) {
    return jid.endsWith("@g.us");
}

export function getParticipants(metadata) {
    return metadata?.participants || [];
}

export function getAdmins(metadata) {
    return getParticipants(metadata).filter(
        user => user.admin !== null
    );
}