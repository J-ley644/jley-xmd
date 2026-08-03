import warningStore from "../../system/warningStore.js";

export default {

    name: "warnings",

    aliases: [
        "warns"
    ],

    category: "group",

    description: "View a member's warnings",

    usage: ".warnings @user",

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

Reply to or mention a member to view warnings.

Example:
.warnings @user`

            );

        }


        const data =
            warningStore.getUser(
                ctx.chat,
                target
            );


        const number =
            target
                .split("@")[0]
                .split(":")[0];


        let text =

`╭━━━〔 📋 WARNING HISTORY 〕━━━╮

👤 Member

@${number}

⚠️ Total Warnings

${data.count}

━━━━━━━━━━━━━━━━━━
`;


        if (data.history.length) {

            text +=
`\n📝 Records\n\n`;


            data.history.forEach(
                (warn, index) => {

                    text +=

`#${index + 1}
📌 ${warn.reason}
📅 ${new Date(warn.time).toLocaleString()}

`;

                }
            );


        } else {

            text +=

`\n✅ No warnings found

This member has a clean record.`;

        }


        text +=

`
━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`;


        await ctx.reply(

            text,

            {
                mentions: [
                    target
                ]
            }

        );

    }

};