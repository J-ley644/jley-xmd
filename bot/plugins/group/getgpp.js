export default {

    name: "getgpp",

    aliases: [
        "grouppp",
        "groupdp"
    ],

    category: "general",

    description: "View the group's profile picture",

    usage: ".getgpp",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        if (!ctx.isGroup) {

            return ctx.reply(
                "❌ This command can only be used in a group."
            );

        }

        try {

            const url =
                await ctx.client.profilePictureUrl(
                    ctx.jid,
                    "image"
                );

            return ctx.send({

                image: {
                    url
                },

                caption:

`╭━━━━━━━━〔 👥 GROUP PICTURE 〕━━━━━━━━╮
┃
┃  👥 ${ctx.groupName || "Group"}
┃
┃  🤖 ${ctx.botName}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

            });

        }

        catch {

            return ctx.error(
`❌ Unable to retrieve the group profile picture.

Possible reasons:

• The group has no profile picture.
• Privacy settings prevent access.
• The picture is unavailable.`
            );

        }

    }

};