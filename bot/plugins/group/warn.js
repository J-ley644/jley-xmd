import warningStore from "../../system/warningStore.js";

export default {

    name: "warn",

    aliases: [
        "warning"
    ],

    category: "group",

    description: "Warn a group member",

    usage: ".warn [reason]",

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

Reply to or mention the member you want to warn.

Example:
.warn Spamming links`

            );

        }


        const reason =
            ctx.args.join(" ") ||
            "No reason provided";


        const result =
            warningStore.warn(
                ctx.chat,
                target,
                ctx.sender,
                reason
            );


        const number =
            target
                .split("@")[0]
                .split(":")[0];


        const text =

`╭━━━〔 ⚠️ WARNING ISSUED 〕━━━╮

👤 Member

@${number}

📊 Total Warnings

${result.count}

📝 Reason

${reason}

━━━━━━━━━━━━━━━━━━

⚡ Issued By

@${ctx.sender.split("@")[0]}

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`;


        await ctx.reply(

            text,

            {
                mentions: [
                    target,
                    ctx.sender
                ]
            }

        );

    }

};