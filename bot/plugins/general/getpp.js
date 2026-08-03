export default {

    name: "getpp",

    aliases: [
        "pp",
        "profilepic"
    ],

    category: "general",

    description: "View a user's profile picture",

    usage: ".getpp [@user]",

    permissions: {},


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

            await ctx.send({

                image: {
                    url
                },

                caption:

`╭━━━〔 👤 PROFILE PICTURE 〕━━━╮

📱 User
+${number}

━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`

            });

        }

        catch {

            await ctx.reply(

`❌ Unable to retrieve the profile picture.

Possible reasons:

• The user has no profile picture.
• Privacy settings prevent access.
• The picture is unavailable.`

            );

        }

    }

};