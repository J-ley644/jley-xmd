import os from "os";
import pluginStore from "../../system/pluginStore.js";


export default {

    name: "status",

    aliases: [
        "health"
    ],

    category: "general",

    description: "Show bot system status",

    usage: ".status",

    permissions: {},


    async execute(ctx) {


        const memory =
            process.memoryUsage().rss / 1024 / 1024;


        const uptime =
            ctx.runtime?.formatUptime
            ? ctx.runtime.formatUptime()
            : "Unknown";


        const text =

`╭━━━〔 📊 SYSTEM STATUS 〕━━━╮


🤖 BOT

Name:
${ctx.botName}

Version:
${ctx.version}

Status:
🟢 Online


━━━━━━━━━━━━━━━━━━


⚙️ ENGINE

Runtime:
Node.js ${process.version}

Platform:
${os.platform()} ${os.arch()}

Mode:
${ctx.config?.mode || "Public"}


━━━━━━━━━━━━━━━━━━


🧩 SYSTEM

Plugins:
${pluginStore.size()}

Memory:
${memory.toFixed(2)} MB

Uptime:
${uptime}


━━━━━━━━━━━━━━━━━━


🚀 SERVICE HEALTH

Commands:
🟢 Active

Database:
🟢 Ready

Automation:
🟢 Running


━━━━━━━━━━━━━━━━━━


⚡ Powered by ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`;



        await ctx.reply(text);

    }

};