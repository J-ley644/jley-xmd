export default {

    name: "anime",

    aliases: ["animepic", "anim",

    ],

    category: "anime",

    description: "Get a random anime image.",

    usage: ".anime",

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

                caption: "🎌 Random Anime"

            });

        } catch (error) {

            console.error(
                "[ANIME]",
                error
            );

            return ctx.error(
                "Failed to fetch an anime image."
            );

        }

    }

};