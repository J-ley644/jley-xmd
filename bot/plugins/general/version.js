import config from "../../config/config.js";

export default {

    name: "version",

    aliases: ["ver"],

    category: "general",

    description: "Show JLEY-XMD version",

    usage: ".version",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(
`🤖 ${config.botName}

📦 Version:
${config.version}

⚡ Status:
Online ✅`
        );

    }

};