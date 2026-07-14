export default {

    name: "alive",

    aliases: ["online"],

    category: "general",

    description: "Check bot status",

    async execute(ctx) {

        const text = `
╭━━━〔 🤖 JLEY-XMD 〕━━━╮

🟢 Status   : Online
⚡ Engine   : Running
📦 Version  : ${ctx.version}
⏱ Runtime  : ${ctx.runtime.formatUptime()}

━━━━━━━━━━━━━━━━━━

🚀 Powered by JLEY-XMD
⚙️ Plugin-Based WhatsApp Bot

╰━━━━━━━━━━━━━━━━━━╯
`;

        await ctx.reply(text);

    }

};