import automationStore from "../../system/automationStore.js";

export default {

    name: "autoreplymsg",

    aliases: [
        "setreply",
        "replymsg"
    ],

    category: "automation",

    description: "Set your automatic reply message",

    usage: ".autoreplymsg <message>",

    permissions: {},


    async execute(ctx) {

        const message =
            ctx.args.join(" ").trim();


        // Show current message

        if (!message) {

            const settings =
                automationStore.get(ctx.sender);

            return ctx.reply(

`╭━━━〔 💬 AUTO REPLY MESSAGE 〕━━━╮

Current Message

${settings.autoreplyText}

━━━━━━━━━━━━━━━━━━

Example

.autoreplymsg Hello!

I'm currently unavailable.

━━━━━━━━━━━━━━━━━━

Supported Variables

{name}
{number}
{time}
{date}
{day}
{bot}
{owner}

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        // Prevent extremely long messages

        if (message.length > 1000) {

            return ctx.reply(
                "❌ Reply message is too long."
            );

        }


        automationStore.update(

            ctx.sender,

            {

                autoreplyText: message

            }

        );


        await ctx.reply(

`╭━━━〔 ✅ AUTO REPLY UPDATED 〕━━━╮

Your automatic reply has been updated.

━━━━━━━━━━━━━━━━━━

New Message

${message}

━━━━━━━━━━━━━━━━━━

Use

.autoreply on

to enable automatic replies.

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};