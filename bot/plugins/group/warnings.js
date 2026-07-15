import warningStore from "../../system/warningStore.js";

export default {

    name: "warnings",

    aliases: ["warns"],

    category: "group",

    description: "View a member's warnings.",

    usage: ".warnings",

    permissions: {
        group: true,
        admin: true
    },

    async execute(ctx) {

        const target = ctx.target;

        if (!target) {

            return ctx.reply(
                "❌ Reply to or mention a user."
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
`🤖 ${ctx.botName}

⚠️ Warning Information

👤 User: @${number}
📊 Total Warnings: ${data.count}
`;

        if (data.history.length) {

            text += "\n📝 History\n\n";

            data.history.forEach((warn, index) => {

                text +=
`${index + 1}. ${warn.reason}
📅 ${new Date(warn.time).toLocaleString()}

`;

            });

        }

        await ctx.reply(
            text,
            {
                mentions: [target]
            }
        );

    }

};