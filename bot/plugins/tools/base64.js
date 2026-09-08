export default {

    name: "base64",

    aliases: [
        "b64"
    ],

    category: "tools",

    description: "Encode or decode Base64 text",

    usage: ".base64 <encode|decode> <text>",

    permissions: {
    botOwner: true
},

    async execute(ctx) {

        if (ctx.args.length < 2) {

            return ctx.error(
`?? Base64

Usage:
${ctx.prefix}base64 <encode|decode> <text>

Examples:
${ctx.prefix}base64 encode Hello World
${ctx.prefix}base64 decode SGVsbG8gV29ybGQ=`
            );

        }

        const action =
            ctx.args[0].toLowerCase();

        const text =
            ctx.args.slice(1).join(" ");

        try {

            let result;

            if (action === "encode") {

                result =
                    Buffer
                        .from(text, "utf8")
                        .toString("base64");

            } else if (action === "decode") {

                if (
                    !/^[A-Za-z0-9+/]*={0,2}$/.test(text) ||
                    text.length % 4 !== 0
                ) {

                    return ctx.error(
                        "? Invalid Base64 string."
                    );

                }

                result =
                    Buffer
                        .from(text, "base64")
                        .toString("utf8");

            } else {

                return ctx.error(
                    "? Action must be `encode` or `decode`."
                );

            }

            return ctx.success(
`?? Base64

?? Action � ${action}

${result}

?? ${ctx.botName}`
            );

        } catch (error) {

            console.error(
                "Base64 command error:",
                error
            );

            return ctx.error(
                "? Unable to process the Base64 input."
            );

        }

    }

};
