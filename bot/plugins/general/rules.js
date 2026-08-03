export default {

    name: "rules",

    aliases: [
        "guidelines"
    ],

    category: "general",

    description: "Show JLEY-XMD usage rules",

    usage: ".rules",

    permissions: {},


    async execute(ctx) {


        const text =

`╭━━━〔 📜 JLEY-XMD RULES 〕━━━╮

🤖 BOT USAGE RULES

1️⃣ Use commands responsibly

2️⃣ Do not spam commands or abuse bot features

3️⃣ Do not attempt to crash, exploit, or bypass the bot system

4️⃣ Respect bot limits and cooldowns


━━━━━━━━━━━━━━━━━━

📱 WHATSAPP POLICY

5️⃣ Follow WhatsApp Terms of Service

6️⃣ Do not use JLEY-XMD for:
   • Spam campaigns
   • Harassment
   • Scams
   • Illegal activities
   • Malicious automation

7️⃣ Respect user privacy and consent

8️⃣ Do not collect or share personal information without permission


━━━━━━━━━━━━━━━━━━

👥 COMMUNITY RULES

9️⃣ Respect all members

🔟 No hate speech, threats, or harmful content

1️⃣1️⃣ No flooding or unnecessary tagging

1️⃣2️⃣ Follow group administrator instructions


━━━━━━━━━━━━━━━━━━

⚠️ DISCLAIMER

JLEY-XMD is an automation platform.
Users are responsible for how they use the bot.

━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

⚡ Build responsibly.
Use technology wisely.

╰━━━━━━━━━━━━━━━━━━╯`;


        await ctx.reply(text);

    }

};