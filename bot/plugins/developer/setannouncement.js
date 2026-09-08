import menuStore from "../../system/menuStore.js";

export default {

    name: "setannouncement",

    aliases: [
        "setnews",
        "announce"
    ],

    category: "developer",

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

            return ctx.error(

`Please provide an announcement.

Example:
${ctx.prefix}setannouncement 🚀 AI Module launching next week!`

            );

        }

        menuStore.setAnnouncement(

            text,

            ctx.pushName || "Owner"

        );

        return ctx.success(

`Global announcement updated successfully.

📢 Announcement

${text}

Users will now see this announcement in .menu.`

        );

    }

};