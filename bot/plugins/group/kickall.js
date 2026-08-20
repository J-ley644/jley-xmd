export default {

    name: "kickall",

    aliases: [
        "removeall"
    ],

    category: "group",

    description: "Remove all group members except the bot",

    usage: ".kickall",

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
            | Bot Identity
            |--------------------------------------------------------------------------
            */

            const botId =
                ctx.client.user?.id || "";

            const botLid =
                ctx.client.user?.lid || "";


            /*
            |--------------------------------------------------------------------------
            | Find Members To Remove
            |--------------------------------------------------------------------------
            |
            | Remove everyone except the bot.
            |
            | This intentionally includes:
            |
            | - normal members
            | - group admins
            |
            | The command is already restricted to the bot owner.
            |
            */

            const targets =
                participants
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
            | Nothing To Remove
            |--------------------------------------------------------------------------
            */

            if (!targets.length) {

                return ctx.reply(
                    "ℹ️ There are no other members to remove."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Remove Members
            |--------------------------------------------------------------------------
            */

            await ctx.client.groupParticipantsUpdate(
                ctx.chat,
                targets,
                "remove"
            );


            /*
            |--------------------------------------------------------------------------
            | Success
            |--------------------------------------------------------------------------
            */

            return ctx.reply(

`╭━━━〔 👢 GROUP CLEARED 〕━━━╮

👥 Members Removed
${targets.length}

🤖 Bot
Preserved

⚡ Executed By
${ctx.sender.split("@")[0]}

🛡️ Bot Admin
Preserved

╰━━━━━━━━━━━━━━━━━━╯`

            );


        } catch (error) {

            console.error(
                "KickAll error:",
                error
            );


            return ctx.reply(
                "❌ Failed to remove the group members."
            );

        }

    }

};