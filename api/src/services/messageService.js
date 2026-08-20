import { handleCommand } from "../../../bot/core/commandHandler.js";
import loadPlugins from "../../../bot/core/pluginLoader.js";
import config from "../../../bot/config/config.js";
import automationStore from "../../../bot/system/automationStore.js";
import relationshipTracker from "../../../bot/system/relationshipTracker.js";


let pluginsLoaded = false;


async function ensurePluginsLoaded() {

    if (pluginsLoaded) {
        return;
    }

    await loadPlugins();

    pluginsLoaded = true;

    console.log(
        "JLEY-XMD advanced plugins loaded."
    );

}


/*
|--------------------------------------------------------------------------
| Automation Identity
|--------------------------------------------------------------------------
*/

function getBotIdentity(sock) {

    return (
        sock?.user?.lid ||
        sock?.user?.id ||
        null
    );

}


/*
|--------------------------------------------------------------------------
| AutoTyping
|--------------------------------------------------------------------------
*/

async function handleAutoTyping(
    sock,
    message,
    jid
) {

    /*
    |--------------------------------------------------------------------------
    | Ignore invalid messages
    |--------------------------------------------------------------------------
    */

    if (
        !sock ||
        !message ||
        !jid
    ) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Ignore bot's own messages
    |--------------------------------------------------------------------------
    */

    if (
        message.key?.fromMe
    ) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Ignore WhatsApp status
    |--------------------------------------------------------------------------
    */

    if (
        jid === "status@broadcast" ||
        jid.endsWith("status@broadcast")
    ) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Bot Identity
    |--------------------------------------------------------------------------
    */

    const botIdentity =
        getBotIdentity(sock);


    if (!botIdentity) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Load Bot Settings
    |--------------------------------------------------------------------------
    */

    const settings =
        automationStore.get(
            botIdentity
        );


    /*
    |--------------------------------------------------------------------------
    | Chat-Specific Override
    |--------------------------------------------------------------------------
    */

    let enabled =
        settings?.autotyping === true;


    const chatSettings =
        settings?.chats?.[jid];


    if (
        chatSettings &&
        Object.prototype.hasOwnProperty.call(
            chatSettings,
            "autotyping"
        )
    ) {

        enabled =
            chatSettings.autotyping === true;

    }


    /*
    |--------------------------------------------------------------------------
    | Disabled
    |--------------------------------------------------------------------------
    */

    if (!enabled) {

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | Show Typing
    |--------------------------------------------------------------------------
    */

    try {

        await sock.sendPresenceUpdate(
            "composing",
            jid
        );


        /*
        |--------------------------------------------------------------------------
        | Stop Typing After Delay
        |--------------------------------------------------------------------------
        */

        setTimeout(
            async () => {

                try {

                    await sock.sendPresenceUpdate(
                        "paused",
                        jid
                    );

                } catch {

                    // Ignore presence cleanup errors.

                }

            },
            2000
        );


    } catch (error) {

        console.error(
            "AutoTyping error:",
            error?.message ||
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| Relationship Tracking
|--------------------------------------------------------------------------
|
| This runs for normal group messages.
|
| It is intentionally independent from the command handler so the
| relationship system can learn from ordinary conversation too.
|
*/

function trackRelationship(
    sock,
    message
) {

    try {

        relationshipTracker.trackMessage(
            sock,
            message
        );

    } catch (error) {

        /*
         * Relationship tracking must NEVER break
         * the main message engine.
         */

        console.error(
            "Relationship tracking error:",
            error?.message ||
            error
        );

    }

}


/*
|--------------------------------------------------------------------------
| Message Handler
|--------------------------------------------------------------------------
*/

export async function handleMessage(
    sock,
    message
) {

    if (!message?.message) {
        return;
    }


    const jid =
        message.key?.remoteJid;


    if (!jid) {
        return;
    }


    /*
    |--------------------------------------------------------------------------
    | Extract Text
    |--------------------------------------------------------------------------
    */

    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        "";


    /*
    |--------------------------------------------------------------------------
    | Ignore Empty Messages
    |--------------------------------------------------------------------------
    */

    if (!text.trim()) {
        return;
    }


    /*
    |--------------------------------------------------------------------------
    | Relationship Tracking
    |--------------------------------------------------------------------------
    |
    | Track before command filtering so normal group conversation and
    | command messages can both contribute to relationship analysis.
    |
    | The tracker itself ignores:
    |
    | - private chats
    | - bot's own messages
    | - status messages
    |
    */

    trackRelationship(
        sock,
        message
    );


    /*
    |--------------------------------------------------------------------------
    | AutoTyping
    |--------------------------------------------------------------------------
    |
    | Run independently so the typing indicator does not delay
    | command execution.
    |
    */

    void handleAutoTyping(
        sock,
        message,
        jid
    );


    /*
    |--------------------------------------------------------------------------
    | Own Messages
    |--------------------------------------------------------------------------
    |
    | Own messages are allowed only when they are actual bot commands.
    |
    */

    if (
        message.key?.fromMe &&
        !text.trim().startsWith(
            config.prefix
        )
    ) {

        return;

    }


    try {

        await ensurePluginsLoaded();


        await handleCommand(
            sock,
            message
        );


    } catch (error) {

        console.error(
            "Advanced message engine error:",
            error
        );

    }

}