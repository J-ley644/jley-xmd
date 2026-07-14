import generateMenu from "../../lib/menu.js";
import pluginStore from "../../system/pluginStore.js";

export default {

    name: "menu",

    aliases: [
        "help"
    ],

    category: "general",

    description: "Display command menu",

    usage: ".menu",

    permissions: {},

    async execute(ctx) {

        const menu = generateMenu(
            pluginStore.getAll()
        );

        await ctx.reply(menu);

    }

};