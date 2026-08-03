import os from "os";
import pluginStore from "../../system/pluginStore.js";


export default {

    name: "botinfo",

    aliases: [
        "info"
    ],

    category: "general",

    description: "Show detailed bot information",

    usage: ".botinfo",

    permissions: {},


    async execute(ctx) {


        const memory =
            process.memoryUsage().rss / 1024 / 1024;


        const uptime =
            ctx.runtime?.formatUptime
            ? ctx.runtime.formatUptime()
            : "Unknown";


        const text =

`╭━━━〔 🤖 BOT INFORMATION 〕━━━╮

📌 Name
${ctx.botName}

📦 Version
${ctx.version}

🟢 Status
Online

⚙️ Mode
${ctx.config?.mode || "Public"}

━━━━━━━━━━━━━━━━━━

🧩 Plugins
${pluginStore.size()}

💾 Memory
${memory.toFixed(2)} MB

🖥 Platform
${os.platform()} ${os.arch()}

⏱ Runtime
${uptime}

━━━━━━━━━━━━━━━━━━

⚡ Engine
JLEY-XMD Core

🚀 Architecture
Plugin Based

╰━━━━━━━━━━━━━━━━━━╯`;


        await ctx.reply(text);

    }

};