export default {

    name: "ping",

    cooldown: 5,

    aliases: [
        "p"
    ],

    category: "general",

    description: "Check bot response speed",

    usage: ".ping",

    permissions: {},

    async execute(ctx) {

        const start =
            Date.now();

        const latency =
            Date.now() - start;

        return ctx.info(

`🏓 PONG

⚡ Response   • ${latency} ms
🟢 Status     • Online
🤖 Engine     • JLEY-XMD
📦 Version    • ${ctx.version}`

        );

    }

};