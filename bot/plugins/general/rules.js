import config from "../../config/config.js";

export default {

    name: "rules",

    aliases: ["policy"],

    category: "general",

    description: "Show bot rules",

    usage: ".rules",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(
`📜 ${config.botName} Rules

1️⃣ Do not spam commands
2️⃣ Respect group members
3️⃣ Do not abuse bot features
4️⃣ Follow WhatsApp policies

⚡ Use responsibly.`
        );

    }

};