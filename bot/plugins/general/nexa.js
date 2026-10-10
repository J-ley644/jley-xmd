
import nexaStore from "../../system/nexaStore.js";
import { isOwner } from "../../lib/permissions.js";

function getDeploymentId(ctx) {
    return String(ctx.deploymentId || "main");
}

function getUsage(prefix) {
    return `NEXA — OFFICIAL JLEY-XMD AI ASSISTANT

${prefix}nexa on here
Enable NEXA in this chat

${prefix}nexa off here
Disable NEXA in this chat

${prefix}nexa on
Enable NEXA globally (owner only)

${prefix}nexa off
Disable NEXA globally (owner only)

${prefix}nexa status
View NEXA settings

${prefix}nexa reset
Clear this chat's AI memory`;
}

export default {
    name: "nexa",
    aliases: ["chatbot"],
    category: "ai",
    description: "Control the NEXA AI assistant.",
    usage: ".nexa on/off/status/reset",
    cooldown: 2,
    permissions: {},

    async execute(ctx) {
        const deploymentId = getDeploymentId(ctx);
        const action = (ctx.args[0] || "").toLowerCase();
        const scope = (ctx.args[1] || "").toLowerCase();

        if (!action || action === "help") {
            return ctx.reply(getUsage(ctx.prefix));
        }

        if (action === "status") {
            const settings = nexaStore.getSettings(
                deploymentId,
                ctx.chat
            );

            const override = settings.chatOverride === null
                ? "INHERIT GLOBAL SETTING"
                : settings.chatOverride
                    ? "ENABLED IN THIS CHAT"
                    : "DISABLED IN THIS CHAT";

            return ctx.reply(
`🤖 NEXA STATUS

Global: ${settings.globalEnabled ? "ON" : "OFF"}
This chat: ${override}
Effective status: ${settings.enabled ? "ON" : "OFF"}`
            );
        }

        if (action === "reset") {
            nexaStore.resetHistory(deploymentId, ctx.chat);

            return ctx.reply(
                "🧠 NEXA memory for this chat has been reset."
            );
        }

        if (!["on", "off"].includes(action)) {
            return ctx.reply(getUsage(ctx.prefix));
        }

        const enabled = action === "on";

        if (scope === "here") {
            if (ctx.isGroup && !ctx.isAdmin && !isOwner(ctx)) {
                return ctx.reply(
                    "❌ A group admin or the bot owner must change NEXA settings here."
                );
            }

            nexaStore.setChat(
                deploymentId,
                ctx.chat,
                enabled
            );

            return ctx.reply(
                enabled
                    ? "🤖 NEXA is now enabled in this chat."
                    : "🤖 NEXA is now disabled in this chat."
            );
        }

        if (scope) {
            return ctx.reply(getUsage(ctx.prefix));
        }

        if (!isOwner(ctx)) {
            return ctx.reply(
                "❌ Only the bot owner can change NEXA's global setting."
            );
        }

        nexaStore.setGlobal(deploymentId, enabled);

        return ctx.reply(
            enabled
                ? "🤖 NEXA is now enabled globally for this deployment."
                : "🤖 NEXA is now disabled globally for this deployment."
        );
    }
};
