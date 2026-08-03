import autoMentionStore from "../../system/autoMentionStore.js";

export default {

    name: "automention",

    aliases: [
        "statusmention"
    ],

    category: "group",

    description: "Automatically mention this group whenever you post a status",

    usage: ".automention <on|off|status>",

    permissions: {

        group: true

    },


    async execute(ctx) {

        const option =
            (ctx.args[0] || "")
            .toLowerCase();


        if (!option) {

            return ctx.reply(

`╭━━━〔 📢 AUTO MENTION 〕━━━╮

Usage

.automention on
.automention off
.automention status

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        if (option === "status") {

            const enabled =
                autoMentionStore.isEnabled(
                    ctx.chat,
                    ctx.sender
                );


            return ctx.reply(

`╭━━━〔 📢 AUTO MENTION 〕━━━╮

Group

${ctx.groupMetadata?.subject || "Unknown"}

━━━━━━━━━━━━━━━━━━

Status

${enabled ? "🟢 Enabled" : "🔴 Disabled"}

━━━━━━━━━━━━━━━━━━

When enabled, every status you
post will automatically mention
this group.

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        if (option === "on") {

            autoMentionStore.enable(

                ctx.chat,

                ctx.sender

            );


            return ctx.reply(

`╭━━━〔 ✅ AUTO MENTION 〕━━━╮

Auto Mention has been enabled
for this group.

Whenever you post a status,
this group will automatically
be mentioned.

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        if (option === "off") {

            autoMentionStore.disable(

                ctx.chat,

                ctx.sender

            );


            return ctx.reply(

`╭━━━〔 ❌ AUTO MENTION 〕━━━╮

Auto Mention has been disabled
for this group.

Future statuses will no longer
mention this group.

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        return ctx.reply(

`❌ Invalid option.

Use

.automention on
.automention off
.automention status`

        );

    }

};