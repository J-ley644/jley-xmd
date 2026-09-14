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
        jleyOwner: true
    },

    async execute(ctx) {

        const text =
            ctx.args.join(" ").trim();

        if (!text) {

            return ctx.reply(
`❌ Please provide an announcement.

Example:
${ctx.prefix}setannouncement 🚀 AI Module launching next week!`
            );

        }

        try {

            menuStore.setAnnouncement(
                text,
                ctx.pushName || "Owner"
            );

            return ctx.reply(
`✅ Global announcement updated successfully.

📢 Announcement

${text}

Users will now see this announcement in .menu.`
            );

        } catch (error) {

            console.error(
                "Announcement update failed:",
                error
            );

            return ctx.reply(
                "❌ Failed to update the announcement."
            );

        }

    }

};