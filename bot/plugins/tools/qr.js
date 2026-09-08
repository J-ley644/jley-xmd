export default {

    name: "qr",

    aliases: [
        "qrcode"
    ],

    category: "tools",

    description: "Generate a QR code from text or a URL",

    usage: ".qr <text or URL>",

    permissions: {},

    async execute(ctx) {

        const text =
            ctx.args.join(" ").trim();

        if (!text) {

            return ctx.error(

`?? QR Code Generator

Usage:
${ctx.prefix}qr <text or URL>

Examples:
${ctx.prefix}qr https://example.com
${ctx.prefix}qr Hello JLEY-XMD`

            );

        }

        try {

            const qrcode =
                await import("qrcode-terminal");

            return new Promise((resolve) => {

                qrcode.default.generate(
                    text,
                    { small: true },
                    (code) => {

                        ctx.reply(
`?? QR Code

${code}

?? ${ctx.botName}`
                        );

                        resolve();

                    }
                );

            });

        } catch (error) {

            console.error("QR command error:", error);

            return ctx.error(
                "? Failed to generate QR code."
            );

        }

    }

};
