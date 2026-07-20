import config from "../../config/config.js";

export default {

    name: "repo",

    aliases: ["github"],

    category: "general",

    description: "Show JLEY-XMD repository",

    usage: ".repo",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(
`🔗 ${config.botName} Repository

${config.repo}`
        );

    }

};