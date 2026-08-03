export default {

    name: "demote",

    aliases: [
        "removeadmin"
    ],

    category: "group",

    description: "Remove admin privileges from a member",

    usage: ".demote @user",

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

Reply to the admin you want to demote.

Example:
.demote @user`

            );

        }


        if (target === ctx.client.user?.id) {

            return ctx.reply(
                "🤖 I cannot remove my own permissions."
            );

        }


        try {

            await ctx.client.groupParticipantsUpdate(
                ctx.chat,
                [target],
                "demote"
            );


            await ctx.reply(

`╭━━━〔 ⬇️ ADMIN REMOVED 〕━━━╮

👤 Member

@${target.split("@")[0]}

🔻 New Role

Group Member

⚡ Action By

${ctx.sender.split("@")[0]}

╰━━━━━━━━━━━━━━━━━━╯`

            );


        } catch(error) {

            await ctx.reply(
                "❌ Failed to remove admin privileges."
            );

        }

    }

};