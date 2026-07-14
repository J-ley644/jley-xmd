import pluginStore from "../../system/pluginStore.js";

export default {

    name: "plugins",

    aliases: ["pl"],

    category: "general",

    description: "Show loaded plugins.",

    usage: ".plugins",

    permissions: {},

    async execute(ctx) {

        const plugins = pluginStore.getAll();

        const categories = {};

        for (const [, plugin] of plugins) {

            const category = plugin.category || "other";

            if (!categories[category]) {

                categories[category] = [];

            }

            categories[category].push(plugin.name);

        }

        let text =
`╭━━━〔 PLUGINS 〕━━━╮

Loaded Plugins: ${pluginStore.size()}

━━━━━━━━━━━━━━

`;

        for (const category in categories) {

            text += `📂 ${category.toUpperCase()}\n`;

            text += categories[category]
                .sort()
                .map(cmd => `• ${cmd}`)
                .join("\n");

            text += "\n\n";

        }

        text += "╰━━━━━━━━━━━━━━╯";

        await ctx.reply(text);

    }

};