import config from "../../config/config.js";

export default {

    name: "about",

    aliases: ["bot"],

    category: "general",

    description: "About JLEY-XMD",

    usage: ".about",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(
`🤖 ${config.botName}

A next generation WhatsApp automation platform.

⚡ Fast
🧩 Plugin Based
🚀 Scalable

📦 Version:
${config.version}

❤️ Developed by ${config.ownerName}`
        );

    }

};