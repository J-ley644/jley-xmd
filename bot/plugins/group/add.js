export default {

    name: "add",

    aliases: [],

    category: "group",

    description: "Add a member to the group.",

    usage: ".add 2547XXXXXXXX",

    permissions: {
        group: true,
        admin: true,
        botAdmin: true
    },

    async execute(ctx) {

        const number =
            ctx.args[0]?.replace(/\D/g, "");

        if (!number) {

            return ctx.reply(
                "❌ Example:\n.add 254700123456"
            );

        }

        const jid =
            `${number}@s.whatsapp.net`;

        await ctx.client.groupParticipantsUpdate(
            ctx.chat,
            [jid],
            "add"
        );

        await ctx.reply("✅ Member added.");

    }

};