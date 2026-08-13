export default {

    name: "features",

    aliases: [
        "feature",
        "capabilities"
    ],

    category: "general",

    description: "Show JLEY-XMD features",

    usage: ".features",

    permissions: {},

    async execute(ctx) {

        return ctx.info(

`⚡ JLEY-XMD FEATURES

🤖 CORE ENGINE
⚡ Fast command processing
🧩 Plugin-based architecture
🔄 Modular system design
🚀 Scalable bot framework

👥 GROUP MANAGEMENT
🛡️ Admin tools
⚠️ Warning system
🔗 Anti-link protection
👋 Welcome & goodbye system
📢 Member tagging tools

⚙️ AUTOMATION
📦 Custom commands
🔌 Plugin extensions
📊 System monitoring
🔐 Permission control
⏱️ Cooldown protection

🌐 PLATFORM
📱 WhatsApp automation
🤖 Multi-purpose assistant
🏗️ Developer friendly
🚀 Continuous improvements

🔥 Built for reliability.
Designed for the future.

🤖 ${ctx.botName}`

        );

    }

};