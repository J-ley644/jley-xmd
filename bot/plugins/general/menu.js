import fs from "fs";

import generateMenu from "../../lib/menu.js";
import pluginStore from "../../system/pluginStore.js";
import menuStore from "../../system/menuStore.js";

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
        plugins,
        ctx
    );

        if (menuStore.hasBanner()) {

            return ctx.send({

                image: fs.readFileSync(
                    menuStore.bannerPath()
                ),

                caption: menu

            });

        }

        return ctx.reply(
            menu
        );

    }

};