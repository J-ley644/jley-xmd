export default {

    name: "encode",

    aliases: [
        "enc"
    ],

    category: "tools",

    description: "Encode text using common formats",

    usage: ".encode <type> <text>",

    permissions: {
    botOwner: true
},

    async execute(ctx) {

        if (ctx.args.length < 2) {

            return ctx.error(
`?? Encoder

Usage:
${ctx.prefix}encode <type> <text>

Types:
� url
� hex

Examples:
${ctx.prefix}encode url Hello World
${ctx.prefix}encode hex Hello`
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
                    encodeURIComponent(text);

            } else if (type === "hex") {

                result =
                    Buffer
                        .from(text, "utf8")
                        .toString("hex");

            } else {

                return ctx.error(
                    "? Supported types: url, hex"
                );

            }

            return ctx.success(
`?? Encoded Text

?? Type � ${type}

${result}

?? ${ctx.botName}`
            );

        } catch (error) {

            console.error(
                "Encode command error:",
                error
            );

            return ctx.error(
                "? Unable to encode the provided text."
            );

        }

    }

};
