import automationStore from "../../system/automationStore.js";


export default {

    name: "autotyping",

    aliases: [
        "typing"
    ],

    category: "automation",

    description:
        "Automatically show typing status in chats",

    usage:
        ".autotyping <on|off> [here]",

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

`╭━━━〔 ⌨️ AUTO TYPING 〕━━━╮

Usage:

.autotyping on
.autotyping off

For this chat:

.autotyping on here
.autotyping off here

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Current Settings
        |--------------------------------------------------------------------------
        */

        const globalEnabled =
            automationStore.getValue(
                botIdentity,
                "autotyping"
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
                    chatSettings.autotyping
                        ? "🟢 Enabled"
                        : "🔴 Disabled";

            }


            return ctx.reply(

`╭━━━〔 ⌨️ AUTO TYPING 〕━━━╮

Global:
${globalEnabled
    ? "🟢 Enabled"
    : "🔴 Disabled"}

This chat:
${chatStatus}

Usage:

.autotyping on
.autotyping off

.autotyping on here
.autotyping off here

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

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
                    "autotyping",
                    enabled
                );


            return ctx.reply(

`╭━━━〔 ⌨️ AUTO TYPING 〕━━━╮

${updated.autotyping
    ? "🟢 Enabled"
    : "🔴 Disabled"}

Auto typing is now ${
    updated.autotyping
        ? "enabled"
        : "disabled"
} for this chat.

Global setting:
${
    globalEnabled
        ? "🟢 Enabled"
        : "🔴 Disabled"
}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

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
                "autotyping",
                enabled
            );


        return ctx.reply(

`╭━━━〔 ⌨️ AUTO TYPING 〕━━━╮

${updated.autotyping
    ? "🟢 Enabled"
    : "🔴 Disabled"}

Auto typing is now ${
    updated.autotyping
        ? "enabled globally"
        : "disabled globally"
}.

Use:

.autotyping on here
.autotyping off here

to control this chat separately.

╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

        );

    }

};