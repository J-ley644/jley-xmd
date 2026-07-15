import groupSettings from "../../system/groupSettings.js";

export default {

    name: "goodbye",

    aliases: [],

    category: "group",

    description: "Enable or disable goodbye messages.",

    usage: ".goodbye <on|off>",

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

.goodbye on
.goodbye off`
            );

        }

        groupSettings.set(
            ctx.chat,
            "goodbye",
            option === "on"
        );

        await ctx.reply(
`🤖 ${ctx.botName}

✅ Goodbye messages ${
    option === "on"
        ? "enabled"
        : "disabled"
}.`
        );

    }

};