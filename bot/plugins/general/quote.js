export default {

    name: "quote",

    aliases: ["motivate"],

    category: "general",

    description: "Random motivation quote",

    usage: ".quote",

    permissions: {},

    async execute(ctx) {

        const quotes = [

            "🚀 Great things take time and consistency.",

            "⚡ Build quietly. Let success make the noise.",

            "🔥 Every expert was once a beginner.",

            "🧩 Small improvements create big systems."

        ];


        const quote =
            quotes[
                Math.floor(
                    Math.random() * quotes.length
                )
            ];


        await ctx.reply(quote);

    }

};