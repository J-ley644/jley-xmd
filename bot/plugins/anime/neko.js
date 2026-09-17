
export default {

    name: "neko",

    aliases: ["nekos"],

    category: "anime",

    description: "Get a random anime neko image.",

    usage: ".neko",

    cooldown: 10,

    permissions: {},

    async execute(ctx) {

        try {

            const response =
                await fetch(
                    "https://nekos.best/api/v2/neko"
                );

            if (!response.ok) {
                throw new Error(
                    `API returned ${response.status}`
                );
            }

            const data =
                await response.json();

            const imageUrl =
                data?.results?.[0]?.url;

            if (!imageUrl) {
                throw new Error(
                    "No image URL returned"
                );
            }

            await ctx.send({

                image: {
                    url: imageUrl
                },

                caption: "🐱 Neko time!"

            });

        } catch (error) {

            console.error(
                "[NEKO]",
                error
            );

            return ctx.error(
                "Failed to fetch a neko image."
            );

        }

    }

};

