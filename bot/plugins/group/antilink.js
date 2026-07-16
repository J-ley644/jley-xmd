import groupSettings from "../../system/groupSettings.js";


export default {

    name: "antilink",

    category: "group",

    description: "Enable or disable anti-link.",

    usage: ".antilink on/off",

    group: true,

    admin: true,

    async execute(ctx) {

        const option =
            ctx.args[0]?.toLowerCase();

        if (!["on", "off"].includes(option)) {

            return ctx.reply(
`Usage:
.antilink on
.antilink off`
            );

        }

        const enabled =
            option === "on";

        groupSettings.set(
            ctx.chat,
            "antilink",
            enabled
        );

        await ctx.reply(
`🤖 ${ctx.config.botName}

✅ Anti-Link has been ${
    enabled
        ? "enabled"
        : "disabled"
}.`
        );

    }

};