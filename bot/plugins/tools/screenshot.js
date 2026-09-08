/*
|--------------------------------------------------------------------------
| JLEY-XMD SCREENSHOT
|--------------------------------------------------------------------------
|
| Take a screenshot of a webpage.
|
| Usage:
|   .screenshot <URL>
|
|--------------------------------------------------------------------------
*/

export default {

    name: "screenshot",

    aliases: [
        "ss",
        "capture"
    ],

    category: "tools",

    description: "Take a screenshot of a webpage",

    usage: ".screenshot <URL>",

    permissions: {},

    async execute(ctx) {

        const input =
            Array.isArray(ctx.args)
                ? ctx.args.join(" ").trim()
                : "";

        if (!input) {

            return ctx.error(
`?? Web Screenshot

Usage:
${ctx.prefix}screenshot <URL>

Example:
${ctx.prefix}screenshot https://example.com`
            );

        }

        let url;

        try {

            url =
                new URL(input);

        } catch {

            return ctx.error(
                "? Please provide a valid URL."
            );

        }

        if (
            !["http:", "https:"].includes(
                url.protocol
            )
        ) {

            return ctx.error(
                "? Only HTTP and HTTPS URLs are supported."
            );

        }

        try {

            await ctx.reply(
                "?? Taking webpage screenshot..."
            );

            const screenshotUrl =
                `https://image.thum.io/get/width/1200/crop/900/noanimate/${encodeURIComponent(url.href)}`;

            const response =
                await fetch(
                    screenshotUrl,
                    {
                        method: "HEAD"
                    }
                );

            if (!response.ok) {

                throw new Error(
                    `Screenshot service returned HTTP ${response.status}.`
                );

            }

            await ctx.send({

                image: {
                    url: screenshotUrl
                },

                caption:
`?? Web Screenshot

?? ${url.href}

?? ${ctx.botName}`

            });

        } catch (error) {

            console.error(
                "Screenshot command error:",
                error
            );

            return ctx.error(
                "? Unable to capture that webpage right now."
            );

        }

    }

};
