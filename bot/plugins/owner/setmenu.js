import fs from "fs";
import menuStore from "../../system/menuStore.js";

export default {

    name: "setmenu",

    aliases: [
        "menubanner"
    ],

    category: "owner",

    description: "Set the global menu banner",

    usage: ".setmenu (reply to an image)",

    permissions: {

        owner: true

    },

    async execute(ctx) {

        if (!ctx.isReply) {

            return ctx.reply(

`❌ Reply to an image.

Example:

Reply to a photo then send

.setmenu`

            );

        }

        if (!ctx.isImage) {

            return ctx.reply(
                "❌ The replied message must be an image."
            );

        }

        try {

            const buffer =
                await ctx.download();

            fs.writeFileSync(

                menuStore.bannerPath(),

                buffer

            );

            await ctx.reply(

`✅ Menu banner updated successfully.

Every user will now receive the new banner when using .menu.`

            );

        }

        catch (error) {

            console.error(error);

            await ctx.reply(

                "❌ Failed to update the menu banner."

            );

        }

    }

};