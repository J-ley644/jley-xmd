import config from "../../config/config.js";

export default {

    name: "source",

    aliases: ["code"],

    category: "general",

    description: "Show JLEY-XMD source code",

    usage: ".source",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(
`📦 ${config.botName} Source

🔗 ${config.repo}

⭐ Star the project if you find it useful.`
        );

    }

};