const quotes = [

    "Great systems are built one feature at a time.",

    "Consistency creates what motivation starts.",

    "Every powerful platform began as a small idea.",

    "Code is not just written, it is engineered.",

    "Success comes from improving a little every day.",

    "A good developer solves problems before they appear.",

    "Build quietly. Let the results make the noise.",

    "The best automation is created by understanding people."

];


export default {

    name: "quote",

    aliases: [
        "q"
    ],

    category: "general",

    description: "Get a random inspirational quote",

    usage: ".quote",

    permissions: {},


    async execute(ctx) {


        const quote =
            quotes[
                Math.floor(
                    Math.random() * quotes.length
                )
            ];


        const text =

`╭━━━〔 💡 DAILY QUOTE 〕━━━╮

"${quote}"

━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

⚡ Keep building. Keep improving.

╰━━━━━━━━━━━━━━━━━━╯`;


        await ctx.reply(text);

    }

};