export default {

    name: "ping",

    cooldown: 5,

    aliases: ["p"],

    category: "general",

    description: "Check bot speed",

    permissions: {},

    async execute(ctx) {

        const start = Date.now();

        const latency =
            Date.now() - start;

        await ctx.reply(

`🏓 Pong!

⚡ ${latency} ms

🤖 JLEY-XMD`

        );

    }

};