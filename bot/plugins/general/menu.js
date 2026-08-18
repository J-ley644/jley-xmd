import generateMenu from "../../lib/menu.js";
import pluginStore from "../../system/pluginStore.js";
import menuStore from "../../system/menuStore.js";

const CHANNEL_URL =
    "https://whatsapp.com/channel/0029Vb8fXJpEquiKJsG56i29";

export default {

    name: "menu",

    aliases: [
        "commands",
        "list"
    ],

    category: "general",

    description:
        "Display available bot commands.",

    usage:
        ".menu [category]",

    cooldown: 5,

    permissions: {},

    async execute(ctx) {

        const plugins =
            pluginStore.getAll();

        const requestedCategory =
            ctx.args?.join(" ").trim() ||
            null;

        const menu =
            generateMenu(
                plugins,
                ctx,
                requestedCategory
            );

        /*
        |--------------------------------------------------------------------------
        | Banner Menu
        |--------------------------------------------------------------------------
        */

        if (
            await menuStore.hasBanner()
        ) {

            const banner =
                await menuStore.getBanner();

            return ctx.send({

                image:
                    banner,

                caption:
                    menu,

                footer:
                    "🤖 JLEY-XMD",

                channelButton: {

                    url:
                        CHANNEL_URL

                }

            });

        }

        /*
        |--------------------------------------------------------------------------
        | Text Menu
        |--------------------------------------------------------------------------
        */

        return ctx.send({

            text:
                menu,

            footer:
                "🤖 JLEY-XMD",

            channelButton: {

                url:
                    CHANNEL_URL

            }

        });

    }

};