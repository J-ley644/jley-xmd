import groupSettings from "../../system/groupSettings.js";

export default {

    name: "welcome",

    aliases: [],

    category: "group",

    description: "Enable or disable welcome messages.",

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

        groupSettings.set(
            ctx.chat,
            "welcome",
            option === "on"
        );

        await ctx.reply(
`🤖 ${ctx.botName}

✅ Welcome messages ${
    option === "on"
        ? "enabled"
        : "disabled"
}.`
        );

    }

};