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
            .help
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
`╭━━━〔 📖 ${config.botName} HELP 〕━━━╮

📚 Available Categories

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
`━━━━━━━━━━━━━━━━━━

Example:

${config.prefix}help ping

${config.prefix}help group

🤖 ${config.botName}

╰━━━━━━━━━━━━━━━━━━╯`;



            return ctx.reply(text);

        }




        /*
            .help category
        */


        const categoryExists =
            [...plugins.values()]
            .some(command =>
                (command.category || "other")
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
            .help command
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





        return ctx.reply(

`╭━━━〔 ❌ NOT FOUND 〕━━━╮

Command:

${config.prefix}${query}

does not exist.

Try:

${config.prefix}menu

╰━━━━━━━━━━━━━━━━━━╯`

        );


    }

};