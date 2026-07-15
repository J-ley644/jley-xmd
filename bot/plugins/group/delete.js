export default {

    name: "delete",

    aliases: ["del"],

    category: "group",

    description: "Delete a replied message.",

    usage: ".delete",

    permissions: {
        group: true,
        admin: true,
        botAdmin: true
    },

    async execute(ctx) {

        const key =
            ctx.message.message
                ?.extendedTextMessage
                ?.contextInfo
                ?.stanzaId;

        const participant =
            ctx.message.message
                ?.extendedTextMessage
                ?.contextInfo
                ?.participant;

        if (!key || !participant) {

            return ctx.reply(
                "❌ Reply to the message you want to delete."
            );

        }

        await ctx.client.sendMessage(
            ctx.chat,
            {
                delete: {
                    remoteJid: ctx.chat,
                    fromMe: false,
                    id: key,
                    participant
                }
            }
        );

    }

};