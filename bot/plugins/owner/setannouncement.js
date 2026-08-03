import menuStore from "../../system/menuStore.js";

export default {

    name: "setannouncement",

    aliases: [
        "setnews",
        "announce"
    ],

    category: "owner",

    description: "Set the global menu announcement",

    usage:
        ".setannouncement <message>",

    permissions: {

        owner: true

    },

    async execute(ctx) {

        const text =
            ctx.args.join(" ").trim();

        if (!text) {

            return ctx.reply(

`❌ Please provide an announcement.

Example:

.setannouncement 🚀 AI Module launching next week!`

            );

        }

        menuStore.setAnnouncement(

            text,

            ctx.pushName || "Owner"

        );

        await ctx.reply(

`✅ Global announcement updated successfully.

📢 New Announcement

${text}

Every user will now see this announcement when using .menu.`

        );

    }

};