import { handleCommand } from "../../../bot/core/commandHandler.js";
import loadPlugins from "../../../bot/core/pluginLoader.js";

let pluginsLoaded = false;

async function ensurePluginsLoaded() {
    if (pluginsLoaded) {
        return;
    }

    await loadPlugins();
    pluginsLoaded = true;

    console.log("JLEY-XMD advanced plugins loaded.");
}

export async function handleMessage(sock, message) {
    if (!message?.message) {
        return;
    }

    if (message.key?.fromMe) {
        return;
    }

    const jid = message.key?.remoteJid;

    if (!jid) {
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
