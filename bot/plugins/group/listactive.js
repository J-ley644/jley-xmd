
import groupActivityStore from "../../system/groupActivityStore.js";

export default {
    name: "listactive",
    aliases: ["mostactive", "topactive"],
    category: "group",
    description: "Rank group members by recorded message activity.",
    usage: ".listactive",

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

        const activity =
            groupActivityStore.getGroupActivity(
                ctx.deploymentId || ctx.socket?.deploymentId,
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

        ranked.sort((a, b) => b.count - a.count);

        const lines = ranked.map((member, index) => {
            const lastSeen = member.lastMessage
                ? new Date(member.lastMessage).toLocaleString()
                : "Never recorded";

            return (
                `${index + 1}. ${member.name}\n` +
                `   Messages: ${member.count}\n` +
                `   Last message: ${lastSeen}`
            );
        });

        const message =
            `📊 *GROUP ACTIVITY RANKING*\n\n` +
            `👥 Members: ${ranked.length}\n` +
            `ℹ️ Counts start when activity tracking is enabled.\n\n` +
            lines.join("\n\n");

        return ctx.reply(message);
    }
};
