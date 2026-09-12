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

👋 WELCOME SYSTEM

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

        if (option === "on") {

            return ctx.reply(
`🤖 ${ctx.botName}

╭━━━〔 👋 WELCOME 〕━━━╮
┃
┃ ✅ Welcome messages are now ON.
┃
┃ New members will automatically
┃ receive a welcome message.
┃
╰━━━━━━━━━━━━━━━━━━━━╯

✨ No extra setup is required.`
            );

        }

        return ctx.reply(
`🤖 ${ctx.botName}

╭━━━〔 👋 WELCOME 〕━━━╮
┃
┃ ❌ Welcome messages are now OFF.
┃
┃ New members will no longer
┃ receive automatic welcomes.
┃
╰━━━━━━━━━━━━━━━━━━━━╯`
        );

    }

};