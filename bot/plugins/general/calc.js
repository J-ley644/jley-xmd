export default {

    name: "calc",

    aliases: [
        "calculate"
    ],

    category: "general",

    description: "Perform mathematical calculations",

    usage: ".calc 10+5",

    permissions: {},


    async execute(ctx) {


        const expression =
            ctx.args.join(" ");


        if (!expression) {

            return ctx.reply(
`╭━━━〔 🧮 CALCULATOR 〕━━━╮

Usage:

.calc expression

Examples:

.calc 20+30
.calc 100/5
.calc 5*5

╰━━━━━━━━━━━━━━━━━━╯`
            );

        }


        try {


            // Basic calculator evaluation
            const result =
                Function(
                    `"use strict"; return (${expression})`
                )();


            await ctx.reply(

`╭━━━〔 🧮 CALCULATOR 〕━━━╮

📌 Expression

${expression}

━━━━━━━━━━━━━━━━━━

✅ Result

${result}

━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`

            );


        } catch(error) {


            await ctx.reply(

`❌ Invalid calculation.

Example:

.calc 25*4`

            );

        }

    }

};