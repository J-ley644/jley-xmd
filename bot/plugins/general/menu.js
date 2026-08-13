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

    description: "Display available bot commands.",

    usage: ".menu [category]",

    cooldown: 5,

    permissions: {},

    async execute(ctx) {

        const plugins =
            pluginStore.getAll();

        const requestedCategory =
            ctx.args?.join(" ").trim() || null;

        const menu =
            generateMenu(
                plugins,
                ctx,
                requestedCategory
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