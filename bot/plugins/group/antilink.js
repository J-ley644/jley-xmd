import groupSettings from "../../system/groupSettings.js";

export default {

    name: "antilink",

    aliases: [
        "antilinks"
    ],

    category: "group",

    description: "Enable or disable anti-link protection",

    usage: ".antilink on/off",

    permissions: {
        group: true,
        admin: true
    },

    async execute(ctx) {

        const option =
            ctx.args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return ctx.reply(

`⚠️ Usage Error

Enable protection:
.antilink on

Disable protection:
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

`╭━━━〔 🛡️ ANTI-LINK 〕━━━╮

🔗 Protection

${enabled ? "Enabled" : "Disabled"}

👥 Group

${ctx.groupMetadata?.subject || "Unknown"}

⚡ Changed By

${ctx.sender.split("@")[0]}

━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};