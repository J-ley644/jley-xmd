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
            ctx.args.join(" ").trim();

        if (!expression) {

            return ctx.error(

`🧮 Calculator

Usage:
${ctx.prefix}calc <expression>

Examples:
${ctx.prefix}calc 20+30
${ctx.prefix}calc 100/5
${ctx.prefix}calc 5*5`

            );

        }

        try {

            const result =
                Function(
                    `"use strict"; return (${expression})`
                )();

            return ctx.success(

`🧮 Calculation

📌 Expression  • ${expression}
✅ Result      • ${result}

🤖 ${ctx.botName}`

            );

        } catch (error) {

            return ctx.error(

`🧮 Invalid calculation

Expression:
${expression}

Example:
${ctx.prefix}calc 25*4`

            );

        }

    }

};