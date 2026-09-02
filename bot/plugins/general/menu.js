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

        const menuWithChannel =
            `${menu}\n\n📢 JLEY-XMD Channel\n${CHANNEL_URL}`;

        if (
            await menuStore.hasBanner()
        ) {

            const banner =
                await menuStore.getBanner();

            return ctx.send({

                image: banner,

                caption: menuWithChannel,

                linkPreview: true

            });

        }

        return ctx.send({

            text: menuWithChannel,

            linkPreview: true

        });

    }

};