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
    if (
        !sock ||
        !message ||
        !jid
    ) {
        return;
    }


    // Ignore WhatsApp status
    if (
        jid === "status@broadcast" ||
        jid.endsWith("status@broadcast")
    ) {
        return;
    }

    const botIdentity =
        getBotIdentity(sock);

    if (!botIdentity) {
        return;
    }

    const settings =
        automationStore.get(
            botIdentity
        );

    /*
     * If Auto Recording is enabled for this
     * chat, recording takes priority over typing.
     */
    let recordingEnabled =
        settings?.autorecording === true;

    const chatSettings =
        settings?.chats?.[jid];

    if (
        chatSettings &&
        Object.prototype.hasOwnProperty.call(
            chatSettings,
            "autorecording"
        )
    ) {
        recordingEnabled =
            chatSettings.autorecording === true;
    }

    if (recordingEnabled) {
        return;
    }

    /*
     * Auto Typing
     */
    let enabled =
        settings?.autotyping === true;

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

    if (!enabled) {
        return;
    }

    try {

        await sock.sendPresenceUpdate(
            "composing",
            jid
        );

        /*
         * Keep typing visible for 5 seconds.
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
            5000
        );

    } catch (error) {

        console.error(
            "AutoTyping error:",
            error?.message ||
            error
        );
    }
}


async function handleAutoRecording(
    sock,
    message,
    jid
) {
    if (
        !sock ||
        !message ||
        !jid
    ) {
        return;
    }


    // Ignore WhatsApp status
    if (
        jid === "status@broadcast" ||
        jid.endsWith("status@broadcast")
    ) {
        return;
    }

    const botIdentity =
        getBotIdentity(sock);

    if (!botIdentity) {
        return;
    }

    const settings =
        automationStore.get(
            botIdentity
        );

    /*
     * Global setting
     */
    let enabled =
        settings?.autorecording === true;

    /*
     * Chat-specific override
     */
    const chatSettings =
        settings?.chats?.[jid];

    if (
        chatSettings &&
        Object.prototype.hasOwnProperty.call(
            chatSettings,
            "autorecording"
        )
    ) {
        enabled =
            chatSettings.autorecording === true;
    }

    if (!enabled) {
        return;
    }

    try {

        console.log(
            "[AutoRecording] Recording:",
            jid
        );

        await sock.sendPresenceUpdate(
            "recording",
            jid
        );

        /*
         * Keep recording indicator visible
         * for 5 seconds.
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
            5000
        );

    } catch (error) {

        console.error(
            "AutoRecording error:",
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

    /*
 * Auto Recording
 *
 * Recording takes priority over typing.
 */
void handleAutoRecording(
    sock,
    message,
    jid
);

/*
 * Auto Typing
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