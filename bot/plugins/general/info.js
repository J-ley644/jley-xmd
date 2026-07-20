import config from "../../config/config.js";

export default {

    name: "info",

    aliases: ["botinfo"],

    category: "general",

    description: "Show bot information",

    usage: ".info",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(
`🤖 ${config.botName}

📦 Version:
${config.version}

⚙️ Mode:
${config.mode}

📡 Status:
${config.status}

🧩 Plugin Based
🚀 Multi Deployment Ready`
        );

    }

};