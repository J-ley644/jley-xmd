import { handleCommand } from "../../../bot/core/commandHandler.js";

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