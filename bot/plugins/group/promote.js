export default {

    name: "promote",

    aliases: [
        "admin"
    ],

    category: "group",

    description: "Promote a member to group admin",

    usage: ".promote @user",

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

Reply to the member you want to promote.

Example:
.promote @user`

            );

        }


        if (target === ctx.client.user?.id) {

            return ctx.reply(
                "🤖 I am already managing the group."
            );

        }


        try {

            await ctx.client.groupParticipantsUpdate(
                ctx.chat,
                [target],
                "promote"
            );


            await ctx.reply(

`╭━━━〔 👑 ADMIN PROMOTION 〕━━━╮

👤 Member

@${target.split("@")[0]}

⬆️ New Role

Group Admin

⚡ Approved By

${ctx.sender.split("@")[0]}

╰━━━━━━━━━━━━━━━━━━╯`

            );


        } catch(error) {

            await ctx.reply(
                "❌ Failed to promote member."
            );

        }

    }

};