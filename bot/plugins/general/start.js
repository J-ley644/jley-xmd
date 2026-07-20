import pluginStore from "../../system/pluginStore.js";

import config from "../../config/config.js";

export default {

    name: "stats",

    aliases: ["status"],

    category: "general",

    description: "Show bot statistics",

    usage: ".stats",

    permissions: {},

    async execute(ctx) {

        const plugins =
            pluginStore.size();


        await ctx.reply(
`📊 ${config.botName} Stats

🤖 Version:
${config.version}

🧩 Plugins:
${plugins}

⚡ Status:
Online`
        );

    }

};