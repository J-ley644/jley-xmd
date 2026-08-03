import config from "../../config/config.js";


export default {

    name: "readme",

    aliases: [
        "aboutbot",
        "docs"
    ],

    category: "general",

    description: "Show complete JLEY-XMD documentation",

    usage: ".readme",

    permissions: {},


    async execute(ctx) {


        const text =

`╭━━━〔 📖 ${config.botName} README 〕━━━╮


🤖 ABOUT JLEY-XMD

${config.botName} is a next generation
WhatsApp automation platform designed
to provide powerful, reliable and
scalable bot experiences.


━━━━━━━━━━━━━━━━━━

🚀 VISION

To create a modern automation ecosystem
where users can build, manage and
deploy intelligent WhatsApp solutions.


━━━━━━━━━━━━━━━━━━

⚡ FEATURES

• Plugin based command system
• Group management tools
• Automation engine
• Multi deployment support
• Scalable bot architecture
• Developer friendly framework


━━━━━━━━━━━━━━━━━━

🧩 TECHNOLOGY

Architecture:
Plugin Based Engine

Platform:
WhatsApp Automation

Version:
${config.version}

Mode:
${config.mode}


━━━━━━━━━━━━━━━━━━

👨‍💻 OWNER & DEVELOPER

Name:
${config.owner.name}

Role:
Creator & Maintainer

Project:
${config.botName}


━━━━━━━━━━━━━━━━━━

📜 TERMS OF SERVICE

By using ${config.botName},
you agree:

• Do not use the bot for spam
• Do not abuse automation features
• Do not perform illegal activities
• Respect WhatsApp policies
• Respect other users


━━━━━━━━━━━━━━━━━━

🔒 PRIVACY POLICY

${config.botName} respects user privacy.

Users should:

• Avoid sharing sensitive information
• Use automation responsibly
• Protect their own accounts

No system should be used to
collect personal information
without consent.


━━━━━━━━━━━━━━━━━━

⚠️ DISCLAIMER

Users are responsible for their
own usage of ${config.botName}.

The developer is not responsible
for misuse of the platform.


━━━━━━━━━━━━━━━━━━

❤️ PROJECT MESSAGE

Built with passion,
improved through innovation,
and developed step by step.

Thank you for supporting
${config.botName}.


╰━━━━━━━━━━━━━━━━━━╯`;



        await ctx.reply(text);

    }

};