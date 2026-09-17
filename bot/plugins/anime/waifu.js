export default {

    name: "waifu",

    aliases: ["waifus"],

    category: "anime",

    description: "Get a random anime waifu image.",

    usage: ".waifu",

    cooldown: 10,

    permissions: {},

    async execute(ctx) {

        try {

            const response =
                await fetch(
                    "https://api.waifu.pics/sfw/waifu"
                );

            if (!response.ok) {
                throw new Error(
                    `API returned ${response.status}`
                );
            }

            const data =
                await response.json();

            if (!data?.url) {
                throw new Error(
                    "No image URL returned"
                );
            }

            await ctx.send({

                image: {
                    url: data.url
                },

                caption: "🌸 Random Waifu"

            });

        } catch (error) {

            console.error(
                "[WAIFU]",
                error
            );

            return ctx.error(
                "Failed to fetch a waifu image."
            );

        }

    }

};