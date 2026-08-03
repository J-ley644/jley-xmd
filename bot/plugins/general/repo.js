import config from "../../config/config.js";


export default {

    name: "repo",

    aliases: [
        "github",
        "source"
    ],

    category: "general",

    description: "Show JLEY-XMD project information",

    usage: ".repo",

    permissions: {},


    async execute(ctx) {


        const text =

`╭━━━〔 🌐 JLEY-XMD PROJECT 〕━━━╮

🤖 Project
${config.botName}

📦 Version
${config.version}

━━━━━━━━━━━━━━━━━━

🧩 Architecture
Plugin Based System

⚡ Engine
WhatsApp Automation Core

🚀 Status
Active Development

🔧 Mode
${config.mode}

━━━━━━━━━━━━━━━━━━

👨‍💻 Developer
${config.owner.name}

🔥 Built with passion

╰━━━━━━━━━━━━━━━━━━╯`;


        await ctx.reply(text);

    }

};