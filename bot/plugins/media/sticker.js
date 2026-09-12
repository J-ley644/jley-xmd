export default {

    name: "sticker",

    aliases: ["s"],

    category: "media",

    description: "Convert an image or video into a sticker.",

    usage: ".sticker",

    cooldown: 5,

    permissions: {},

    async execute(ctx) {

        if (!ctx.isReply || (!ctx.isImage && !ctx.isVideo)) {

            return ctx.error(
                "Reply to an image or short video with .sticker"
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            await ctx.send({

                sticker: buffer

            });

        } catch (error) {

            console.error(
                "[STICKER]",
                error
            );

            return ctx.error(
                "Failed to create the sticker."
            );

        }

    }

};