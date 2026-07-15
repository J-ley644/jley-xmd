import warningStore from "../../system/warningStore.js";

export default {

    name: "clearwarns",

    aliases: ["resetwarns"],

    category: "group",

    description: "Clear all warnings for a member.",

    usage: ".clearwarns",

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

        warningStore.clear(
            ctx.chat,
            target
        );

        const number =
            target
                .split("@")[0]
                .split(":")[0];

        await ctx.reply(
`🤖 ${ctx.botName}

✅ Warnings Cleared

👤 User: @${number}

All warnings have been removed.`,
            {
                mentions: [target]
            }
        );

    }

};