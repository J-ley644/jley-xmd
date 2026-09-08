export default {

    name: "decode",

    aliases: [
        "dec"
    ],

    category: "tools",

    description: "Decode URL or hexadecimal text",

    usage: ".decode <type> <text>",

    permissions: { botOwner: true },

    async execute(ctx) {

        if (ctx.args.length < 2) {

            return ctx.error(
`?? Decoder

Usage:
${ctx.prefix}decode <type> <text>

Types:
• url
• hex

Examples:
${ctx.prefix}decode url Hello%20World
${ctx.prefix}decode hex 48656c6c6f`
            );

        }

        const type =
            ctx.args[0].toLowerCase();

        const text =
            ctx.args.slice(1).join(" ");

        try {

            let result;

            if (type === "url") {

                result =
                    decodeURIComponent(text);

            } else if (type === "hex") {

                if (
                    !/^(?:[0-9a-fA-F]{2})+$/.test(text)
                ) {

                    return ctx.error(
                        "? Invalid hexadecimal string."
                    );

                }

                result =
                    Buffer
                        .from(text, "hex")
                        .toString("utf8");

            } else {

                return ctx.error(
                    "? Supported types: url, hex"
                );

            }

            return ctx.success(
`?? Decoded Text

?? Type • ${type}

${result}

?? ${ctx.botName}`
            );

        } catch (error) {

            console.error(
                "Decode command error:",
                error
            );

            return ctx.error(
                "? Unable to decode the provided text."
            );

        }

    }

};
