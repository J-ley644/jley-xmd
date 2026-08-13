import pluginStore from "../../system/pluginStore.js";

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



        for (const [, plugin] of plugins) {

            const category =
                plugin.category || "other";

            if (!categories[category]) {

                categories[category] = [];

            }

            categories[category]
                .push(plugin.name);

        }



        let text =
`╭━━━━━━━━〔 🧩 PLUGIN SYSTEM 〕━━━━━━━━╮
┃
┃  📦 Loaded Plugins • ${pluginStore.size()}
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



        return ctx.reply(text);

    }

};