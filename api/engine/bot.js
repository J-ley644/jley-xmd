const botId = process.env.BOT_ID || "unknown";
const botName = process.env.BOT_NAME || "JLEY-XMD";
const session = process.env.BOT_SESSION || "";

console.log(`JLEY-XMD engine started`);
console.log(`Bot ID: ${botId}`);
console.log(`Bot Name: ${botName}`);
console.log(`Session: ${session ? "loaded" : "not loaded"}`);

let shuttingDown = false;

process.on("SIGTERM", () => {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log(`JLEY-XMD engine stopping...`);

    process.exit(0);
});

process.on("SIGINT", () => {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log(`JLEY-XMD engine stopping...`);

    process.exit(0);
});

setInterval(() => {
    if (!shuttingDown) {
        console.log(`JLEY-XMD engine alive - ${botId}`);
    }
}, 30000);
