import automationStore from "../../system/automationStore.js";
import config from "../../config/config.js";


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeJid(jid) {

    if (!jid) {
        return null;
    }


    return String(jid)
        .trim()
        .replace(/:\d+@/, "@");

}


function normalizeNumber(value) {

    return String(value || "")
        .replace(/\D/g, "");

}


function jidFromNumber(value) {

    const number =
        normalizeNumber(value);


    if (!number) {
        return null;
    }


    return `${number}@s.whatsapp.net`;

}


function getDeveloperJids(activeConfig) {

    const candidates = [

        activeConfig?.developer?.number,

        activeConfig?.developer?.phone,

        activeConfig?.developer?.jid,

        activeConfig?.developerNumber,

        activeConfig?.developerPhone,

        activeConfig?.developerJid

    ];


    return candidates
        .filter(Boolean)
        .flatMap(value => {

            const stringValue =
                String(value).trim();


            if (
                stringValue.includes("@")
            ) {

                return [
                    normalizeJid(stringValue)
                ];

            }


            const jid =
                jidFromNumber(stringValue);


            return jid
                ? [jid]
                : [];

        });

}


function getOwnerJids(activeConfig) {

    const candidates = [

        activeConfig?.owner?.number,

        activeConfig?.owner?.phone,

        activeConfig?.owner?.jid

    ];


    return candidates
        .filter(Boolean)
        .flatMap(value => {

            const stringValue =
                String(value).trim();


            if (
                stringValue.includes("@")
            ) {

                return [
                    normalizeJid(stringValue)
                ];

            }


            const jid =
                jidFromNumber(stringValue);


            return jid
                ? [jid]
                : [];

        });

}


/*
|--------------------------------------------------------------------------
| Authorization
|--------------------------------------------------------------------------
|
| Allowed:
| 1. Deployment owner
| 2. JLEY-XMD developer
|
|--------------------------------------------------------------------------
*/

function isAuthorized(ctx) {

    const sender =
        normalizeJid(ctx.sender);


    if (!sender) {
        return false;
    }


    const activeConfig =
        ctx.config || config;


    /*
    |--------------------------------------------------------------------------
    | JLEY-XMD developer
    |--------------------------------------------------------------------------
    */

    const developerJids =
        getDeveloperJids(
            activeConfig
        );


    if (
        developerJids.some(
            jid =>
                normalizeJid(jid) === sender
        )
    ) {

        return true;

    }


    /*
    |--------------------------------------------------------------------------
    | Configured owner
    |--------------------------------------------------------------------------
    */

    const ownerJids =
        getOwnerJids(
            activeConfig
        );


    if (
        ownerJids.some(
            jid =>
                normalizeJid(jid) === sender
        )
    ) {

        return true;

    }


    /*
    |--------------------------------------------------------------------------
    | Existing permission engine
    |--------------------------------------------------------------------------
    */

    if (
        ctx.isBotOwner === true
    ) {

        return true;

    }


    if (
        ctx.botOwner === true
    ) {

        return true;

    }


    return false;

}


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
        | Strict authorization
        |--------------------------------------------------------------------------
        */

        if (
            !isAuthorized(ctx)
        ) {

            return ctx.reply(
                "❌ This command is restricted to the bot owner and JLEY-XMD developer."
            );

        }


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