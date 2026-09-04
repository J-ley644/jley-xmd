
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

        const repoUrl =
            "https://github.com/J-ley644/jley-xmd-v2";

        const text =

`╭━━━〔 🌐 JLEY-XMD REPOSITORY 〕━━━╮

🤖 Bot Name
${config.botName}

📦 Version
${config.version}

━━━━━━━━━━━━━━━━━━

🔗 GitHub Repository
${repoUrl}

⭐ Remember to START this repo
🍴 Remember to FORK this repo

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

