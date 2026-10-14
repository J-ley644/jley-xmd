
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
        const botIdentity =
            ctx.deploymentId ||
            ctx.client?.deploymentId;

        if (!botIdentity) {
            return ctx.reply(
                "❌ Unable to identify this bot deployment."
            );
        }

        const emoji = (ctx.args || [])
            .join(" ")
            .trim();

        const settings = automationStore.get(botIdentity);

        if (!emoji) {
            return ctx.reply(
`╭━━━〔 ❤️ AUTO LIKE EMOJI 〕━━━╮

Current Emoji

${settings.autolikeEmoji || "❤️"}

━━━━━━━━━━━━━━━━━━

Examples

.autolikeemoji ❤️
.autolikeemoji 🔥
.autolikeemoji 👍
.autolikeemoji 🤩

Use .autolike on to enable automatic
status reactions.

╰━━━━━━━━━━━━━━━━━━╯`
            );
        }

        // Accept one emoji, including joined sequences and skin tones.
        const segments = [
            ...new Intl.Segmenter(undefined, {
                granularity: "grapheme"
            }).segment(emoji)
        ];

        if (
            segments.length !== 1 ||
            !/\p{Extended_Pictographic}/u.test(emoji)
        ) {
            return ctx.reply(
                "❌ Please provide a single emoji."
            );
        }

        automationStore.set(
            botIdentity,
            "autolikeEmoji",
            emoji
        );

        return ctx.reply(
`╭━━━〔 ✅ AUTO LIKE UPDATED 〕━━━╮

Reaction emoji updated successfully.

New Emoji

${emoji}

Use .autolike on to enable
automatic status reactions.

╰━━━━━━━━━━━━━━━━━━╯`
        );
    }
};
