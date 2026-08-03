export default {

    name: "runtime",

    aliases: [
        "uptime"
    ],

    category: "general",

    description: "Show bot uptime",

    usage: ".runtime",

    permissions: {},


    async execute(ctx) {


        const uptime =
            ctx.runtime?.formatUptime
            ? ctx.runtime.formatUptime()
            : "Unknown";



        await ctx.reply(

`╭━━━〔 ⏱ RUNTIME 〕━━━╮

🤖 Bot
➜ ${ctx.botName}

🟢 Status
➜ Online

⏱ Uptime
➜ ${uptime}

📦 Version
➜ ${ctx.version}

⚡ Engine
➜ Active

╰━━━━━━━━━━━━━━━━━━╯`

        );


    }

};