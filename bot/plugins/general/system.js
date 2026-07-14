import os from "os";
import pluginStore from "../../system/pluginStore.js";

export default {

    name: "system",

    aliases: ["sys"],

    category: "general",

    description: "Show system information.",

    usage: ".system",

    permissions: {},

    async execute(ctx) {

        const memory =
            process.memoryUsage().rss / 1024 / 1024;

        const uptime =
            Math.floor(process.uptime());

        const hours =
            Math.floor(uptime / 3600);

        const minutes =
            Math.floor((uptime % 3600) / 60);

        const seconds =
            uptime % 60;

        const text =
`╭━━━〔 SYSTEM INFO 〕━━━╮

🤖 Bot
${ctx.botName}

📦 Version
${ctx.version}

🖥 Platform
${os.platform()} (${os.arch()})

⚙ Node
${process.version}

💾 Memory
${memory.toFixed(2)} MB

🔌 Plugins
${pluginStore.size()}

📜 Commands
${pluginStore.size()}

⏱ Uptime
${hours}h ${minutes}m ${seconds}s

╰━━━━━━━━━━━━━━━━━━╯`;

        await ctx.reply(text);

    }

};