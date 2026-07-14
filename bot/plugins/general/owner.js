import config from "../../config/config.js";

export default {

    name: "owner",

    aliases: ["creator"],

    category: "general",

    description: "Show bot owner information",

    async execute(ctx) {

        const text = `
╭━━━〔 👤 OWNER INFO 〕━━━╮

👤 Name:
${config.ownerName}

📞 Number:
${config.ownerNumber}

🤖 Bot:
${config.botName}

━━━━━━━━━━━━━━━━━━

Thank you for using JLEY-XMD ❤️

╰━━━━━━━━━━━━━━━━━━╯
`;

        await ctx.reply(text);

    }

};