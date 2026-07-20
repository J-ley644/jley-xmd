import config from "../../config/config.js";

export default {

    name: "support",

    aliases: ["helpdesk"],

    category: "general",

    description: "JLEY-XMD support",

    usage: ".support",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(
`🛠️ ${config.botName} Support

For help and updates:

👤 Owner:
${config.owner.name}

📱 Contact:
${config.owner.number}

⚡ Status:
${config.status}`
        );

    }

};