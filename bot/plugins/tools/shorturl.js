export default {

    name: "shorturl",

    aliases: [
        "short",
        "tinyurl"
    ],

    category: "tools",

    description: "Shorten a URL",

    usage: ".shorturl <URL>",

    permissions: {},

    async execute(ctx) {

        const url =
            ctx.args.join(" ").trim();

        if (!url) {

            return ctx.error(
`?? URL Shortener

Usage:
${ctx.prefix}shorturl <URL>

Example:
${ctx.prefix}shorturl https://example.com`
            );

        }

        let parsedUrl;

        try {

            parsedUrl =
                new URL(url);

        } catch {

            return ctx.error(
                "? Please provide a valid URL."
            );

        }

        if (
            !["http:", "https:"].includes(
                parsedUrl.protocol
            )
        ) {

            return ctx.error(
                "? Only HTTP and HTTPS URLs are supported."
            );

        }

        try {

            const response =
                await fetch(
                    `https://tinyurl.com/api-create.php?url=${encodeURIComponent(parsedUrl.href)}`
                );

            if (!response.ok) {
                throw new Error("Shortening request failed");
            }

            const shortUrl =
                (await response.text()).trim();

            if (
                !shortUrl ||
                !shortUrl.startsWith("http")
            ) {

                throw new Error(
                    "Invalid shortening response"
                );

            }

            return ctx.success(
`?? URL Shortener

?? Original:
${parsedUrl.href}

?? Short URL:
${shortUrl}

?? ${ctx.botName}`
            );

        } catch (error) {

            console.error(
                "Shorturl command error:",
                error
            );

            return ctx.error(
                "? URL shortening service is currently unavailable."
            );

        }

    }

};
