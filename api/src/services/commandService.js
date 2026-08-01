const PREFIX = process.env.PREFIX || ".";

export function getMenu() {
    return `
????? JLEY-XMD ?????
?
? ?? WhatsApp Bot
?
? ${PREFIX}menu
? ${PREFIX}ping
? ${PREFIX}status
? ${PREFIX}help
?
????????????????????
`;
}

export function handleCommand(text) {

    const input = text.trim();

    if (!input.startsWith(PREFIX)) {
        return null;
    }

    const content =
        input.slice(PREFIX.length).trim();

    if (!content) {
        return getMenu();
    }

    const parts =
        content.split(/\s+/);

    const command =
        parts.shift().toLowerCase();

    switch (command) {

        case "menu":
            return getMenu();

        case "help":
            return `
???? JLEY-XMD HELP ????
?
? ${PREFIX}menu
? Show bot menu
?
? ${PREFIX}ping
? Check bot response
?
? ${PREFIX}status
? Check bot status
?
????????????????????????
`;

        case "ping":
            return "?? Pong! JLEY-XMD is online.";

        case "status":
            return "?? JLEY-XMD is running.";

        default:
            return `? Unknown command: ${command}\n\nUse ${PREFIX}menu`;
    }
}
