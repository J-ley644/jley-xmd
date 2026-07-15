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

    const plugins = pluginStore.getAll();

    console.log("PLUGIN COUNT:", plugins.size);

    for (const [key, value] of plugins) {
        console.log(key, "=>", value.name);
    }

    const menu = generateMenu(plugins);

    await ctx.reply(menu);

}

};