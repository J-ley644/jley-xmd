export function containsLink(text) {

    if (!text) return false;

    const value = String(text);

    const urlRegex =
        /(?:https?:\/\/|www\.|wa\.me\/|chat\.whatsapp\.com\/|whatsapp\.com\/|t\.me\/|telegram\.me\/)[^\s]+/i;

    const domainRegex =
        /(?:^|[\s(])(?:[a-z0-9-]+\.)+(?:com|net|org|io|co|ke|app|dev|me|tv|ly|gg)(?:[\/?:#][^\s)]*)?/i;

    return urlRegex.test(value) || domainRegex.test(value);

}