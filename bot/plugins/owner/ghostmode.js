
export default {
    name: "ghostmode",
    aliases: ["alwaysoffline", "alwaysonline"],
    category: "owner",
    description: "Control online visibility",
    usage: ".ghostmode <on|off>",

    permissions: {
        owner: true
    },

    async execute(ctx) {
        const mode = String(ctx.args[0] || "")
            .toLowerCase();

        if (!["on", "off"].includes(mode)) {
            return ctx.reply(
                "👻 *GHOST MODE*\n\n" +
                "• .ghostmode on — Hide online presence\n" +
                "• .ghostmode off — Restore online visibility\n\n" +
                "Aliases:\n" +
                "• .alwaysoffline\n" +
                "• .alwaysonline"
            );
        }

        try {
            if (mode === "on") {
                await ctx.client.updateLastSeenPrivacy("none");
                await ctx.client.updateOnlinePrivacy(
                    "match_last_seen"
                );

                return ctx.reply(
                    "👻 Ghost Mode enabled.\n" +
                    "Online presence and last seen are hidden where supported."
                );
            }

            await ctx.client.updateLastSeenPrivacy("all");
            await ctx.client.updateOnlinePrivacy("all");

            return ctx.reply(
                "👁️ Ghost Mode disabled.\n" +
                "Online visibility and last seen are restored."
            );
        } catch (error) {
            console.error(
                "[GHOST MODE]",
                error?.message || error
            );

            return ctx.reply(
                "❌ Could not update WhatsApp privacy settings.\n" +
                "Details: " + (error?.message || "Unknown error")
            );
        }
    }
};
