import config from "../../config/config.js";


export default {

    name: "support",

    aliases: [
        "contact",
        "helpdesk"
    ],

    category: "general",

    description: "Show JLEY-XMD support contacts",

    usage: ".support",

    permissions: {},


    async execute(ctx) {


        const text =

`╭━━━〔 🆘 JLEY-XMD SUPPORT 〕━━━╮


🤖 Need help with ${config.botName}?

Our support channels:


━━━━━━━━━━━━━━━━━━


📧 EMAIL

smarttechjley@gmail.com


📞 PHONE / CONTACT

0702946278


━━━━━━━━━━━━━━━━━━


🌐 SOCIAL MEDIA


📘 Facebook

jley-xmd

(Coming soon)


📸 Instagram

jleyxmd_

(Coming soon)


🎵 TikTok

JLEY-XMD

(Coming soon)


━━━━━━━━━━━━━━━━━━


💬 WHATSAPP COMMUNITY


👥 WhatsApp Group

Link coming soon


📢 WhatsApp Channel

Link coming soon


━━━━━━━━━━━━━━━━━━


⚡ SUPPORT GUIDELINES

• Describe your issue clearly
• Avoid spam messages
• Respect response time
• Provide useful details when reporting bugs


━━━━━━━━━━━━━━━━━━


🚀 ${config.botName}

Built and maintained by
${config.owner.name}


╰━━━━━━━━━━━━━━━━━━╯`;



        await ctx.reply(text);

    }

};