import automationStore from "../../system/automationStore.js";


export default {

    name: "autorecording",

    aliases: [
        "recording"
    ],

    category: "automation",

    description:
        "Automatically show recording status in chats",

    usage:
        ".autorecording <on|off> [here]",

    permissions: {
        botOwner: true
    },


    async execute(ctx) {

        const option =
            String(
                ctx.args?.[0] || ""
            )
                .trim()
                .toLowerCase();


        const scope =
            String(
                ctx.args?.[1] || ""
            )
                .trim()
                .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | Bot Identity
        |--------------------------------------------------------------------------
        */

        const botLid =
            ctx.client?.user?.lid ||
            null;

        const botId =
            ctx.client?.user?.id ||
            null;

        const botIdentity =
            botLid ||
            botId ||
            ctx.botIdentity ||
            null;


        if (!botIdentity) {

            return ctx.reply(
                "❌ Unable to identify this bot account."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Chat Identity
        |--------------------------------------------------------------------------
        */

        const chat =
            ctx.chat ||
            ctx.message?.key?.remoteJid ||
            null;


        /*
        |--------------------------------------------------------------------------
        | Validate Scope
        |--------------------------------------------------------------------------
        */

        if (
            scope &&
            scope !== "here"
        ) {

            return ctx.reply(

`╭━━━〔 🎙️ AUTO RECORDING 〕━━━╮

Usage:

.autorecording on
.autorecording off

For this chat:

.autorecording on here
.autorecording off here

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Current Global Setting
        |--------------------------------------------------------------------------
        */

        const globalEnabled =
            automationStore.getValue(
                botIdentity,
                "autorecording"
            );


        /*
        |--------------------------------------------------------------------------
        | Show Current Status
        |--------------------------------------------------------------------------
        */

        if (
            !["on", "off"]
                .includes(option)
        ) {

            let chatStatus =
                "Not configured";


            if (chat) {

                const chatSettings =
                    automationStore.getChat(
                        botIdentity,
                        chat
                    );


                chatStatus =
                    chatSettings.autorecording
                        ? "🟢 Enabled"
                        : "🔴 Disabled";

            }


            return ctx.reply(

`╭━━━〔 🎙️ AUTO RECORDING 〕━━━╮

Global:
${globalEnabled
    ? "🟢 Enabled"
    : "🔴 Disabled"}

This chat:
${chatStatus}

Usage:

.autorecording on
.autorecording off

.autorecording on here
.autorecording off here

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Enabled / Disabled
        |--------------------------------------------------------------------------
        */

        const enabled =
            option === "on";


        /*
        |--------------------------------------------------------------------------
        | Chat-Specific Setting
        |--------------------------------------------------------------------------
        */

        if (
            scope === "here"
        ) {

            if (!chat) {

                return ctx.reply(
                    "❌ Unable to identify this chat."
                );

            }


            const updated =
                automationStore.setChat(
                    botIdentity,
                    chat,
                    "autorecording",
                    enabled
                );


            return ctx.reply(

`╭━━━〔 🎙️ AUTO RECORDING 〕━━━╮

${updated.autorecording
    ? "🟢 Enabled"
    : "🔴 Disabled"}

Auto recording is now ${
    updated.autorecording
        ? "enabled"
        : "disabled"
} for this chat.

Global setting:
${
    globalEnabled
        ? "🟢 Enabled"
        : "🔴 Disabled"
}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Global Setting
        |--------------------------------------------------------------------------
        */

        const updated =
            automationStore.set(
                botIdentity,
                "autorecording",
                enabled
            );


        return ctx.reply(

`╭━━━〔 🎙️ AUTO RECORDING 〕━━━╮

${updated.autorecording
    ? "🟢 Enabled"
    : "🔴 Disabled"}

Auto recording is now ${
    updated.autorecording
        ? "enabled globally"
        : "disabled globally"
}.

Use:

.autorecording on here
.autorecording off here

to control this chat separately.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

        );

    }

};