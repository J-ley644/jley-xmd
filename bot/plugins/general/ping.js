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

        const latency =
            Number.isFinite(
                ctx.commandStartTime
            )
                ? Date.now() -
                  ctx.commandStartTime
                : 0;

        const botName =
            ctx.botName ||
            "JLEY-XMD";

        return ctx.reply(

`🤖 ${botName}
🏓 PONG • ${latency} ms`

        );

    }

};