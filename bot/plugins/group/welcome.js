import groupSettings from "../../system/groupSettings.js";

export default {

    name: "welcome",

    aliases: [],

    category: "group",

    description: "Enable or disable automatic welcome messages.",

    usage: ".welcome <on|off>",

    permissions: {
        group: true,
        admin: true
    },

    async execute(ctx) {

        const option =
            ctx.args[0]?.toLowerCase();

        if (
            option !== "on" &&
            option !== "off"
        ) {

            return ctx.reply(
`🤖 ${ctx.botName}

Usage:

.welcome on
.welcome off`
            );

        }

        const enabled =
            option === "on";

        groupSettings.set(
            ctx.chat,
            "welcome",
            enabled
        );

        await ctx.reply(
`🤖 ${ctx.botName}

${enabled
    ? "✅ Welcome messages are now enabled."
    : "❌ Welcome messages are now disabled."
}

${enabled
    ? "New members will automatically receive a welcome message with the group's current description/rules."
    : "New members will no longer receive automatic welcome messages."}`
        );

    }

};