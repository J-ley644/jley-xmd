import { handleCommand } from "../../../bot/core/commandHandler.js";
import loadPlugins from "../../../bot/core/pluginLoader.js";
import config from "../../../bot/config/config.js";

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
     * Extract text before checking fromMe.
     */

    const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        message.message?.imageMessage?.caption ||
        message.message?.videoMessage?.caption ||
        "";

    /*
     * Ignore empty messages.
     */

    if (!text.trim()) {
        return;
    }

    /*
     * Own messages are allowed ONLY when
     * they are actual bot commands.
     *
     * This allows the bot owner to use the
     * same WhatsApp account as the deployment.
     *
     * Normal bot replies will not start with
     * the command prefix and therefore won't
     * be processed again.
     */

    if (
        message.key?.fromMe &&
        !text.trim().startsWith(config.prefix)
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