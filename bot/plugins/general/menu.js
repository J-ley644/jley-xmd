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


        if (
            await menuStore.hasBanner()
        ) {

            const banner =
                await menuStore.getBanner();

            return ctx.send({

                image: banner,

                caption: menu,

                linkPreview: true

            });

        }

        return ctx.send({

    text: menu

});

    }

};