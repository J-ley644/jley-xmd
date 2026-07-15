import warningStore from "../../system/warningStore.js";

export default {

    name: "warn",

    aliases: [],

    category: "group",

    description: "Warn a group member.",

    usage: ".warn [reason]",

    permissions: {
        group: true,
        admin: true
    },

    async execute(ctx) {

        const target = ctx.target;

        if (!target) {

            return ctx.reply(
                "❌ Reply to or mention a user to warn."
            );

        }

        const reason =
            ctx.args.join(" ") ||
            "No reason provided.";

        const result =
            warningStore.warn(
                ctx.chat,
                target,
                ctx.number,
                reason
            );

        const number =
            target
                .split("@")[0]
                .split(":")[0];

        await ctx.reply(
`🤖 ${ctx.botName}

⚠️ Warning Issued

👤 User: @${number}
📊 Warnings: ${result.count}
📝 Reason: ${reason}`,
            {
                mentions: [target]
            }
        );

    }

};