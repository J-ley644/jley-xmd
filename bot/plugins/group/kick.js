export default {

    name: "kick",

    aliases: [
        "remove"
    ],

    category: "group",

    description: "Remove a member from the group",

    usage: ".kick @user",

    permissions: {
        group: true,
        admin: true,
        botAdmin: true
    },

    async execute(ctx) {

        const target =
            ctx.message.message
                ?.extendedTextMessage
                ?.contextInfo
                ?.participant;


        if (!target) {

            return ctx.reply(
`⚠️ Usage Error

Reply to the user's message you want to remove.

Example:
.kick @user`
            );

        }


        if (target === ctx.sender) {

            return ctx.reply(
                "❌ You cannot remove yourself from the group."
            );

        }


        if (target === ctx.client.user?.id) {

            return ctx.reply(
                "🤖 I cannot remove myself."
            );

        }


        try {

            await ctx.client.groupParticipantsUpdate(
                ctx.chat,
                [target],
                "remove"
            );


            await ctx.reply(

`╭━━━〔 👢 MEMBER REMOVED 〕━━━╮

👤 User

@${target.split("@")[0]}

✅ Action
Removed from group

⚡ Executed by
${ctx.sender.split("@")[0]}

╰━━━━━━━━━━━━━━━━━━╯`

            );


        } catch(error) {

            await ctx.reply(
                "❌ Failed to remove member."
            );

        }

    }

};