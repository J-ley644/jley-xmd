import automationStore from "../../system/automationStore.js";

export default {

    name: "autolikeemoji",

    aliases: [
        "likeemoji",
        "statusemoji"
    ],

    category: "automation",

    description: "Set the emoji used for automatic status reactions",

    usage: ".autolikeemoji ❤️",

    permissions: {},


    async execute(ctx) {


        const emoji =
            (ctx.args[0] || "").trim();


        // Show current emoji

        if (!emoji) {

            const settings =
                automationStore.get(ctx.sender);

            return ctx.reply(

`╭━━━〔 ❤️ AUTO LIKE EMOJI 〕━━━╮

Current Emoji

${settings.autolikeEmoji}

━━━━━━━━━━━━━━━━━━

Example

.autolikeemoji ❤️
.autolikeemoji 🔥
.autolikeemoji 👍
.autolikeemoji 🤩

━━━━━━━━━━━━━━━━━━

Use

.autolike on

to enable automatic status reactions.

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        // Basic validation

        if (emoji.length > 8) {

            return ctx.reply(
                "❌ Please provide a single emoji."
            );

        }


        automationStore.update(

            ctx.sender,

            {

                autolikeEmoji: emoji

            }

        );


        await ctx.reply(

`╭━━━〔 ✅ AUTO LIKE UPDATED 〕━━━╮

Your automatic reaction emoji
has been updated.

━━━━━━━━━━━━━━━━━━

New Emoji

${emoji}

━━━━━━━━━━━━━━━━━━

Use

.autolike on

to start reacting to statuses.

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};