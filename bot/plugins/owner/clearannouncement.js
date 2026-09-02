import menuStore from "../../system/menuStore.js";

export default {

    name: "clearannouncement",

    aliases: [
        "clearnews"
    ],

    category: "developer",

    description: "Remove the global menu announcement",

    usage: ".clearannouncement",

    permissions: {

        owner: true

    },

    async execute(ctx) {

        const data =
            menuStore.getAnnouncement();

        if (!data.announcementEnabled) {

            return ctx.reply(
                "❌ No active announcement found."
            );

        }

        menuStore.clearAnnouncement();

        await ctx.reply(

`✅ Global announcement cleared successfully.

Users will no longer see an announcement in the menu.`

        );

    }

};