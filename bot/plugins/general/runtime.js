export default {

    name: "runtime",

    aliases: ["uptime"],

    category: "general",

    description: "Show bot uptime",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(

`🤖 ${ctx.botName}

⏱ Uptime:
${ctx.runtime.formatUptime()}

📦 Version:
${ctx.version}`

        );

    }

};