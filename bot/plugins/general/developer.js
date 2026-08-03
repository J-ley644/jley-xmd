import config from "../../config/config.js";
import pluginStore from "../../system/pluginStore.js";


export default {

    name: "developer",

    aliases: [
        "dev",
        "tech"
    ],

    category: "general",

    description: "Show developer and technical information",

    usage: ".developer",

    permissions: {},


    async execute(ctx) {


        const text =

`╭━━━〔 👨‍💻 DEVELOPER INFO 〕━━━╮


🚀 PROJECT

${config.botName}


━━━━━━━━━━━━━━━━━━


🧩 ARCHITECTURE

⚡ Plugin Based System

🔌 Dynamic Command Loader

🛡️ Permission Engine

⏱️ Cooldown Management

📦 Modular Services


━━━━━━━━━━━━━━━━━━


⚙️ TECHNOLOGY

📱 Platform
WhatsApp Automation

🟢 Runtime
Node.js

📚 Plugins
${pluginStore.size()}

📦 Version
${config.version}


━━━━━━━━━━━━━━━━━━


👑 CREATOR

${config.owner.name}


Role:
Founder & Developer


━━━━━━━━━━━━━━━━━━


🔥 DEVELOPMENT PHILOSOPHY

Build scalable systems.

Keep improving.

Create technology
that solves real problems.


━━━━━━━━━━━━━━━━━━


🤖 ${config.botName}

╰━━━━━━━━━━━━━━━━━━╯`;



        await ctx.reply(text);

    }

};