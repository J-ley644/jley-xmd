import pluginStore from "../../system/pluginStore.js";
import menuStore from "../../system/menuStore.js";

export default {

    name: "plugins",

    aliases: [
        "pl"
    ],

    category: "general",

    description: "Show loaded plugins.",

    usage: ".plugins",

    permissions: {},

    async execute(ctx) {

        const plugins =
            pluginStore.getAll();

        const categories = {};

        const seen = new Set();

        for (const [, plugin] of plugins) {

            if (!plugin?.name) {
                continue;
            }

            const pluginName =
                String(plugin.name)
                    .trim()
                    .toLowerCase();

            if (seen.has(pluginName)) {
                continue;
            }

            seen.add(pluginName);

            const category =
                plugin.category || "other";

            if (!categories[category]) {
                categories[category] = [];
            }

            categories[category].push(
                plugin.name
            );
        }

        let text =
`╭━━━━━━━━〔 🧩 PLUGIN SYSTEM 〕━━━━━━━━╮
┃
┃  📦 Loaded Plugins • ${seen.size}
┃
`;

        Object
            .keys(categories)
            .sort()
            .forEach(category => {

                text +=
`┃
┃  📂 ${category.toUpperCase()}
`;

                categories[category]
                    .sort()
                    .forEach(plugin => {

                        text +=
`┃  • ${ctx.prefix}${plugin}
`;

                    });

            });

        text +=
`┃
┃  🤖 ${ctx.botName}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;


        /*
        |--------------------------------------------------------------------------
        | Use the same banner as .menu
        |--------------------------------------------------------------------------
        */

        if (
            await menuStore.hasBanner()
        ) {

            const banner =
                await menuStore.getBanner();

            return ctx.send({

                image: banner,

                caption: text,

                linkPreview: true

            });

        }


        /*
        |--------------------------------------------------------------------------
        | No banner fallback
        |--------------------------------------------------------------------------
        */

        return ctx.send({

            text

        });

    }

};