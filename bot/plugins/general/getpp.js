export default {

    name: "getpp",

    aliases: [
        "pp",
        "profilepic"
    ],

    category: "general",

    description: "View a user's profile picture",

    usage: ".getpp [@user]",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        try {

            const target =
                ctx.target;

            const url =
                await ctx.client.profilePictureUrl(
                    target,
                    "image"
                );

            const number =
                target
                    .split("@")[0]
                    .split(":")[0];

            return ctx.send({

                image: {
                    url
                },

                caption:

`╭━━━━━━━━〔 👤 PROFILE PICTURE 〕━━━━━━━━╮
┃
┃  📱 User
┃  +${number}
┃
┃  🤖 ${ctx.botName}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

            });

        }

        catch {

            return ctx.error(

`👤 Unable to retrieve the profile picture.

Possible reasons:

• The user has no profile picture.
• Privacy settings prevent access.
• The picture is unavailable.`

            );

        }

    }

};