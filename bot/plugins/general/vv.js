export default {

    name: "vv",

    aliases: [
        "viewonce"
    ],

    category: "general",

    description: "Reveal a replied view-once image or video",

    usage: ".vv",

    permissions: {
    botOwner: true
},


    async execute(ctx) {

        if (!ctx.isReply) {

            return ctx.reply(

"❌ Reply to a view-once image or video."

            );

        }


        if (!ctx.isViewOnce) {

    return ctx.reply(
        "❌ The replied message is not a view-once media."
    );

}


        try {

            const buffer =
                await ctx.download();


            const media =
    ctx.mediaMessage;


            if (media.imageMessage) {

                return ctx.send({

                    image: buffer,

                    caption:
"👁️ View Once unlocked."

                });

            }


            if (media.videoMessage) {

                return ctx.send({

                    video: buffer,

                    caption:
"👁️ View Once unlocked."

                });

            }


            return ctx.reply(

"❌ Unsupported view-once media."

            );

        }

        catch (error) {

            console.error(error);

            return ctx.reply(

"❌ Failed to extract the view-once media."

            );

        }

    }

};