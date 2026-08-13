export default {

    name: "alive",

    aliases: [
        "online"
    ],

    category: "general",

    description: "Check bot online status",

    usage: ".alive",

    permissions: {},

    async execute(ctx) {

        const uptime =
            ctx.runtime?.formatUptime
                ? ctx.runtime.formatUptime()
                : "Unknown";

        return ctx.info(

`🟢 ${ctx.botName} ALIVE

📡 Status     • Online
⚡ Engine     • Running
📦 Version    • ${ctx.version}
⏱️ Runtime    • ${uptime}

🤖 WhatsApp Automation
🧩 Plugin Architecture
🚀 High Performance

👑 Owner      • ${ctx.config.owner.name}`

        );

    }

};