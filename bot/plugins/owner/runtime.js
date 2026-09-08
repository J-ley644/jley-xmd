export default {

    name: "runtime",

    aliases: [
        "uptime"
    ],

    category: "owner",

    description: "Show bot uptime",

    usage: ".runtime",

    permissions: { botOwner: true },


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