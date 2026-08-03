import generateMenu from "../../lib/menu.js";
import pluginStore from "../../system/pluginStore.js";


export default {

    name: "menu",

    aliases: [
        "commands",
        "list"
    ],

    category: "general",

    description: "Display all available bot commands.",

    usage: ".menu",

    cooldown: 5,

    permissions: {},


    async execute(ctx) {


        const plugins =
            pluginStore.getAll();



        const menu =
            generateMenu(
                plugins
            );



        await ctx.reply(
            menu
        );


    }

};