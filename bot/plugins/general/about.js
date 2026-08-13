export default {

    name: "about",

    aliases: [
        "bot"
    ],

    category: "general",

    description: "About JLEY-XMD",

    usage: ".about",

    permissions: {},

    async execute(ctx) {

        return ctx.info(

`🤖 ${ctx.botName}

🚀 Identity
Next Generation WhatsApp Automation Platform

⚡ Performance
Fast • Reliable • Efficient

🧩 Architecture
Plugin-Based System

📡 Platform
Multi-Deployment Ready

📦 Version    • ${ctx.version}
⚙️ Mode       • ${ctx.config.mode}
👑 Developer  • ${ctx.config.owner.name}

🔥 Powered by JLEY-XMD Engine`

        );

    }

};