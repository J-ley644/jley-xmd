import config from "../../config/config.js";

export default {

    name: "owner",

    aliases: ["creator"],

    category: "general",

    description: "Show bot owner information",

    permissions: {
        owner: true
    },

    async execute(ctx) {

        const text = `
╭━━━〔 👤 OWNER INFO 〕━━━╮

👤 Name:
${config.owner.name}


📞 Number:
${config.owner. number}

🤖 Bot:
${config.botName}

━━━━━━━━━━━━━━━━━━

Thank you for using JLEY-XMD ❤️

╰━━━━━━━━━━━━━━━━━━╯
`;

        await ctx.reply(text);

    }

};