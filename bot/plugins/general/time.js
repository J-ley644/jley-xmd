export default {

    name: "time",

    aliases: [
        "date",
        "clock"
    ],

    category: "general",

    description: "Show current server time",

    usage: ".time",

    permissions: {},


    async execute(ctx) {


        const now =
            new Date();



        const date =
            now.toLocaleDateString(
                "en-GB",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );



        const time =
            now.toLocaleTimeString(
                "en-GB",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit"
                }
            );



        const text =

`╭━━━〔 🕒 SERVER TIME 〕━━━╮

📅 Date

${date}


⏰ Time

${time}


🌍 Timezone

${Intl.DateTimeFormat()
    .resolvedOptions()
    .timeZone}

━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`;


        await ctx.reply(text);

    }

};