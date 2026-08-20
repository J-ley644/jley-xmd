export default {

    name: "demoteall",

    aliases: [
        "demoteadmins"
    ],

    category: "group",

    description: "Demote all group admins",

    usage: ".demoteall",

    permissions: {
        group: true,
        botOwner: true,
        botAdmin: true
    },

    async execute(ctx) {

        try {

            const metadata =
                await ctx.client.groupMetadata(
                    ctx.chat
                );


            const participants =
                metadata?.participants || [];


            /*
            |--------------------------------------------------------------------------
            | Find Current Admins
            |--------------------------------------------------------------------------
            */

            const admins =
                participants.filter(
                    participant =>
                        (
                            participant.admin === "admin" ||
                            participant.admin === "superadmin"
                        )
                );


            /*
            |--------------------------------------------------------------------------
            | Bot Identity
            |--------------------------------------------------------------------------
            */

            const botId =
                ctx.client.user?.id || "";

            const botLid =
                ctx.client.user?.lid || "";


            /*
            |--------------------------------------------------------------------------
            | Remove Bot From Target List
            |--------------------------------------------------------------------------
            */

            const targets =
                admins
                    .filter(
                        participant => {

                            const jid =
                                participant.id || "";

                            return (
                                jid &&
                                jid !== botId &&
                                jid !== botLid
                            );

                        }
                    )
                    .map(
                        participant =>
                            participant.id
                    );


            /*
            |--------------------------------------------------------------------------
            | Nothing To Demote
            |--------------------------------------------------------------------------
            */

            if (!targets.length) {

                return ctx.reply(
                    "ℹ️ There are no other group admins to demote."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Demote
            |--------------------------------------------------------------------------
            */

            await ctx.client.groupParticipantsUpdate(
                ctx.chat,
                targets,
                "demote"
            );


            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            return ctx.reply(

`╭━━━〔 ⬇️ ADMINS DEMOTED 〕━━━╮

👥 Admins Removed
${targets.length}

🔻 New Role
Group Member

⚡ Executed By
${ctx.sender.split("@")[0]}

🤖 Bot Admin
Preserved

╰━━━━━━━━━━━━━━━━━━╯`

            );


        } catch (error) {

            console.error(
                "DemoteAll error:",
                error
            );


            return ctx.reply(
                "❌ Failed to demote the group admins."
            );

        }

    }

};