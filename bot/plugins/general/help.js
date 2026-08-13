import config from "../../config/config.js";
import pluginStore from "../../system/pluginStore.js";
import {
    categoryHelp,
    commandHelp
} from "../../lib/help.js";


export default {

    name: "help",

    aliases: [],

    category: "general",

    description: "Show command information",

    usage: ".help <command/category>",

    permissions: {},


    async execute(ctx) {

        const plugins =
            pluginStore.getAll();

        const query =
            (ctx.args[0] || "")
                .toLowerCase();



        /*
        |--------------------------------------------------------------------------
        | .help
        |--------------------------------------------------------------------------
        */

        if (!query) {

            const categories = {};

            for (const [, command] of plugins) {

                const category =
                    command.category || "other";

                if (!categories[category]) {

                    categories[category] = 0;

                }

                categories[category]++;

            }



            let text =
`📖 ${config.botName} HELP

📚 AVAILABLE CATEGORIES

`;

            Object
                .keys(categories)
                .sort()
                .forEach(category => {

                    text +=
`📂 ${category.toUpperCase()}
   └─ ${categories[category]} commands

`;

                });



            text +=
`💡 QUICK HELP

${config.prefix}help <command>
${config.prefix}help <category>

🤖 ${config.botName}`;



            return ctx.info(text);

        }



        /*
        |--------------------------------------------------------------------------
        | .help category
        |--------------------------------------------------------------------------
        */

        const categoryExists =
            [...plugins.values()]
                .some(
                    command =>
                        (
                            command.category ||
                            "other"
                        )
                        .toLowerCase() === query
                );



        if (categoryExists) {

            return ctx.reply(

                categoryHelp(
                    query,
                    plugins
                )

            );

        }



        /*
        |--------------------------------------------------------------------------
        | .help command
        |--------------------------------------------------------------------------
        */

        const command =
            plugins.get(query);



        if (command) {

            return ctx.reply(

                commandHelp(
                    command
                )

            );

        }



        /*
        |--------------------------------------------------------------------------
        | Not Found
        |--------------------------------------------------------------------------
        */

        return ctx.error(

`🔎 Command or category not found.

📌 Search
${config.prefix}${query}

💡 Try
${config.prefix}menu
${config.prefix}help <command>
${config.prefix}help <category>`

        );

    }

};