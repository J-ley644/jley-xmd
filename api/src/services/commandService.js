const PREFIX = process.env.PREFIX || ".";


export function getMenu() {

    return `
╭━━━〔 🤖 JLEY-XMD 〕━━━╮

┃ 📱 WhatsApp Bot
┃ ⚡ Prefix: ${PREFIX}

╭━━〔 COMMANDS 〕━━╮

┃ 📜 ${PREFIX}menu
┃ ⚡ ${PREFIX}ping
┃ 📊 ${PREFIX}status
┃ ❓ ${PREFIX}help

╰━━━━━━━━━━━━━━╯

🚀 Powered by JLEY-XMD ENGINES
`;

}



export function handleCommand(text) {

    const input = text.trim();


    if (!input.startsWith(PREFIX)) {

        return null;

    }



    const content =
        input
            .slice(PREFIX.length)
            .trim();



    if (!content) {

        return getMenu();

    }



    const parts =
        content.split(/\s+/);



    const command =
        parts
            .shift()
            .toLowerCase();



    switch(command) {


        case "menu":

            return getMenu();



        case "help":

            return `
╭━━━〔 ❓ HELP 〕━━━╮

┃ 📜 ${PREFIX}menu
┃ Show all commands

┃ ⚡ ${PREFIX}ping
┃ Check bot speed

┃ 📊 ${PREFIX}status
┃ Check bot status

╰━━━━━━━━━━━━━━╯

🤖 JLEY-XMD
`;



        case "ping":

            return `
╭━━〔 ⚡ PONG 〕━━╮

┃ 🚀 JLEY-XMD is online
┃ ✅ Response successful

╰━━━━━━━━━━━━━━╯
`;



        case "status":

            return `
╭━━〔 📊 STATUS 〕━━╮

┃ 🤖 Bot: JLEY-XMD
┃ 🟢 Status: Online

╰━━━━━━━━━━━━━━╯
`;



        default:

            return `
❌ Unknown command: ${command}

💡 Use ${PREFIX}menu
`;

    }

}