import warningStore from "../../system/warningStore.js";

export default {

    name: "clearwarns",

    aliases: [
        "resetwarns"
    ],

    category: "group",

    description: "Clear all warnings for a member",

    usage: ".clearwarns @user",

    permissions: {
        group: true,
        admin: true
    },

    async execute(ctx) {

        const target =
            ctx.target;


        if (!target) {

            return ctx.reply(

`⚠️ Usage Error

Reply to or mention the member whose warnings you want to clear.

Example:
.clearwarns @user`

            );

        }


        warningStore.clear(
            ctx.chat,
            target
        );


        const number =
            target
                .split("@")[0]
                .split(":")[0];


        await ctx.reply(

`╭━━━〔 🧹 WARNINGS CLEARED 〕━━━╮

👤 Member

@${number}

✅ Status

Warning records removed

━━━━━━━━━━━━━━━━━━

⚡ Cleared By

@${ctx.sender.split("@")[0]}

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`,

            {
                mentions: [
                    target,
                    ctx.sender
                ]
            }

        );

    }

};