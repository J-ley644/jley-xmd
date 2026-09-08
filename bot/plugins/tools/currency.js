export default {

    name: "currency",

    aliases: [
        "convert",
        "fx"
    ],

    category: "tools",

    description: "Convert between currencies",

    usage: ".currency <amount> <from> <to>",

    permissions: {},

    async execute(ctx) {

        const args = ctx.args;

        if (args.length < 3) {

            return ctx.error(
`?? Currency Converter

Usage:
${ctx.prefix}currency <amount> <from> <to>

Examples:
${ctx.prefix}currency 100 USD KES
${ctx.prefix}currency 50 EUR USD`
            );

        }

        const amount =
            Number(args[0]);

        const from =
            args[1].toUpperCase();

        const to =
            args[2].toUpperCase();

        if (!Number.isFinite(amount) || amount <= 0) {

            return ctx.error(
                "? Please provide a valid positive amount."
            );

        }

        if (
            !/^[A-Z]{3}$/.test(from) ||
            !/^[A-Z]{3}$/.test(to)
        ) {

            return ctx.error(
`? Invalid currency code.

Use 3-letter currency codes such as:
USD, EUR, GBP, KES, JPY`
            );

        }

        if (from === to) {

            return ctx.success(
`?? Currency Conversion

${amount} ${from} = ${amount} ${to}

?? ${ctx.botName}`
            );

        }

        try {

            const response =
                await fetch(
                    `https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`
                );

            if (!response.ok) {

                return ctx.error(
`? Currency conversion failed.

Please check that both currency codes are supported.`
                );

            }

            const data =
                await response.json();

            const result =
                data.rates?.[to];

            if (typeof result !== "number") {

                return ctx.error(
                    "? Conversion rate unavailable."
                );

            }

            return ctx.success(
`?? Currency Conversion

?? From      • ${amount} ${from}
?? Result    • ${result} ${to}

?? Rate date • ${data.date || "Latest available"}

?? ${ctx.botName}`
            );

        } catch (error) {

            console.error(
                "Currency command error:",
                error
            );

            return ctx.error(
                "? Currency service is currently unavailable."
            );

        }

    }

};
