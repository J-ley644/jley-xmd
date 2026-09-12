export default {

    name: "toimg",

    aliases: ["toimage"],

    category: "media",

    description: "Convert a sticker into an image.",

    usage: ".toimg",

    cooldown: 5,

    permissions: {},

    async execute(ctx) {

        if (!ctx.isReply || !ctx.isSticker) {

            return ctx.error(
                "Reply to a sticker with .toimg"
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            await ctx.send({

                image: buffer,

                caption: "🖼️ Sticker converted to image."

            });

        } catch (error) {

            console.error(
                "[TOIMG]",
                error
            );

            return ctx.error(
                "Failed to convert the sticker."
            );

        }

    }

};