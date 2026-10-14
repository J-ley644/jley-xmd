
import groupActivityStore from "../../system/groupActivityStore.js";

export default {
    name: "lessactive",
    aliases: ["ghosts", "inactive"],
    category: "group",
    description: "List members with low recorded message activity.",
    usage: ".lessactive",

    permissions: {
        group: true
    },

    async execute(ctx) {
        if (!ctx.isGroup) {
            return ctx.reply("❌ This command can only be used in a group.");
        }

        const groupId = ctx.groupMetadata?.id || ctx.chat;
        const members = ctx.members || [];

        if (!groupId || members.length === 0) {
            return ctx.reply("❌ Could not retrieve this group's members.");
        }

        const deploymentId =
            ctx.deploymentId || ctx.socket?.deploymentId;

        const activity =
            groupActivityStore.getGroupActivity(
                deploymentId,
                groupId
            );

        const ranked = members.map((member) => {
            const memberId =
                typeof member === "string"
                    ? member
                    : member.id || member.jid || member.lid;

            const identities = [
    memberId,
    typeof member === "object" ? member.id : null,
    typeof member === "object" ? member.lid : null,
    typeof member === "object" ? member.jid : null
].filter(Boolean);

const record = identities
    .map(id => activity[id])
    .find(Boolean);

            return {
                id: memberId,
                name:
                    record?.pushName ||
                    member.notify ||
                    member.name ||
                    memberId?.split("@")[0] ||
                    "Unknown",
                count: record?.count || 0,
                lastMessage: record?.lastMessage || null
            };
        });

        // Show the least active members first.
        ranked.sort((a, b) => {
            if (a.count !== b.count) {
                return a.count - b.count;
            }

            return (a.lastMessage || 0) - (b.lastMessage || 0);
        });

        // Limit the response to the 30 least-active members.
        const selected = ranked.slice(0, 30);

        const lines = selected.map((member, index) => {
            const lastMessage = member.lastMessage
                ? new Date(member.lastMessage).toLocaleString()
                : "Never recorded";

            return (
                `${index + 1}. ${member.name}\n` +
                `   Messages recorded: ${member.count}\n` +
                `   Last message: ${lastMessage}`
            );
        });

        return ctx.reply(
            `👻 *LEAST ACTIVE MEMBERS*\n\n` +
            `👥 Members listed: ${selected.length}/${ranked.length}\n` +
            `ℹ️ Activity is counted only since tracking was added.\n\n` +
            lines.join("\n\n")
        );
    }
};
