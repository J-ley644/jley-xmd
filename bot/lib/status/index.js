
import handleAutoMention from "./automention.js";
import handleAutoLike from "./autolike.js";
import handleAutoView from "./autoView.js";

async function handleStatus(socket, message) {
    const key = message?.key;

    console.log("[STATUS PIPELINE] Received event:", {
        deploymentId: socket?.deploymentId,
        remoteJid: key?.remoteJid,
        id: key?.id,
        participant: key?.participant,
        participantPn: key?.participantPn,
        messageTypes: Object.keys(message?.message || {})
    });

    try {
        console.log("[STATUS PIPELINE] Starting AutoView");
        await handleAutoView(socket, message);
        console.log("[STATUS PIPELINE] AutoView finished");
    } catch (error) {
        console.error("[STATUS PIPELINE] AutoView threw:", error?.stack || error);
    }

    try {
        console.log("[STATUS PIPELINE] Starting AutoLike");
        await handleAutoLike(socket, message);
        console.log("[STATUS PIPELINE] AutoLike finished");
    } catch (error) {
        console.error("[STATUS PIPELINE] AutoLike threw:", error?.stack || error);
    }

    try {
        await handleAutoMention(socket, message);
    } catch (error) {
        console.error("[STATUS PIPELINE] AutoMention threw:", error?.stack || error);
    }
}

export default handleStatus;
