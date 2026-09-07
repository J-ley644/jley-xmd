import automationStore from "../../system/automationStore.js";


/*
|--------------------------------------------------------------------------
| Deployment Identity
|--------------------------------------------------------------------------
*/

function getBotIdentity(ctx) {

    return (

        ctx.client?.deploymentId ||

        ctx.botId ||

        ctx.client?.user?.lid ||

        ctx.client?.user?.id ||

        null

    );

}


/*
|--------------------------------------------------------------------------
| Command
|--------------------------------------------------------------------------
*/

export default {

    name:
        "anticall",

    aliases: [],

    category:
        "automation",

    description:
        "Automatically decline incoming WhatsApp calls.",

    usage:
        ".anticall <decline|reply|off>",

    permissions: {
        botOwner: true
    },


    async execute(ctx) {

        /*
        |--------------------------------------------------------------------------
        | Deployment identity
        |--------------------------------------------------------------------------
        */

        const botIdentity =
            getBotIdentity(ctx);


        if (!botIdentity) {

            return ctx.reply(
                "❌ Unable to identify this bot deployment."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Arguments
        |--------------------------------------------------------------------------
        */

        const option =
            String(
                ctx.args?.[0] || ""
            )
                .trim()
                .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | Current settings
        |--------------------------------------------------------------------------
        */

        const settings =
            automationStore.get(
                botIdentity
            );


        /*
        |--------------------------------------------------------------------------
        | No argument
        |--------------------------------------------------------------------------
        */

        if (!option) {

            const mode =
                settings.anticallMode || "off";


            const reply =
                settings.anticallReply ||
                "Not configured";


            return ctx.reply(

`╭━━━〔 📞 ANTICALL 〕━━━╮

📡 Status
${settings.anticall ? "🟢 Enabled" : "🔴 Disabled"}

⚙️ Mode
${mode === "decline"
    ? "🚫 Decline"
    : mode === "reply"
        ? "💬 Decline + Reply"
        : "⚪ Off"}

💬 Reply
${reply}

━━━━━━━━━━━━━━━━━━

Usage:

.anticall decline
.anticall reply <message>
.anticall off

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | OFF
        |--------------------------------------------------------------------------
        */

        if (
            option === "off"
        ) {

            automationStore.update(
                botIdentity,
                {
                    anticall: false,
                    anticallMode: "off"
                }
            );


            return ctx.reply(
                "📞 Anti-call disabled successfully."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | DECLINE
        |--------------------------------------------------------------------------
        */

        if (
            option === "decline"
        ) {

            automationStore.update(
                botIdentity,
                {
                    anticall: true,
                    anticallMode: "decline"
                }
            );


            return ctx.reply(
                "🚫 Anti-call decline enabled.\n\nIncoming WhatsApp calls will now be automatically declined."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | REPLY
        |--------------------------------------------------------------------------
        */

        if (
            option === "reply"
        ) {

            const message =
                ctx.args
                    ?.slice(1)
                    ?.join(" ")
                    ?.trim();


            /*
            |--------------------------------------------------------------------------
            | No new message
            |--------------------------------------------------------------------------
            |
            | Enable existing reply mode.
            |
            */

            if (!message) {

                automationStore.update(
                    botIdentity,
                    {
                        anticall: true,
                        anticallMode: "reply"
                    }
                );


                const currentReply =
                    settings.anticallReply ||
                    "Sorry, I don't take WhatsApp calls. Please send me a message instead.";


                return ctx.reply(

`💬 Anti-call reply enabled.

📞 Incoming calls
🚫 Automatically declined

💬 Reply message
${currentReply}`

                );

            }


            /*
            |--------------------------------------------------------------------------
            | New reply message
            |--------------------------------------------------------------------------
            */

            automationStore.update(
                botIdentity,
                {
                    anticall: true,
                    anticallMode: "reply",
                    anticallReply: message
                }
            );


            return ctx.reply(

`💬 Anti-call reply enabled.

📞 Incoming calls
🚫 Automatically declined

💬 Reply message
${message}`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Unknown option
        |--------------------------------------------------------------------------
        */

        return ctx.reply(

`❌ Invalid anti-call option.

Use:

.anticall decline
.anticall reply <message>
.anticall off`

        );

    }

};