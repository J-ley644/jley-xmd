import groupSettings from "../../system/groupSettings.js";
import { jidMatch } from "../../lib/jid.js";

export default {

    name: "antilink",

    aliases: [
        "antilinks"
    ],

    category: "group",

    description: "Enable or disable anti-link protection",

    usage: ".antilink on/off",

    permissions: {
        group: true
    },

    async execute(ctx) {

        const option =
            ctx.args[0]?.toLowerCase();


        if (!["on", "off"].includes(option)) {

            return ctx.reply(

`⚠️ Usage Error

Enable protection:
.antilink on

Disable protection:
.antilink off`

            );

        }


        /*
         * AntiLink admin check
         *
         * We intentionally do this here instead of using
         * the generic admin permission layer.
         *
         * WhatsApp may expose the same user through:
         * - id
         * - lid
         * - phoneNumber
         * - message participant
         */

        if (!ctx.isAdmin) {

            const metadata =
                await ctx.client.groupMetadata(
                    ctx.chat
                );

            const sender =
                ctx.sender;

            const participant =
                (metadata?.participants || []).find(
                    member =>
                        jidMatch(
                            member?.id,
                            sender
                        ) ||
                        jidMatch(
                            member?.lid,
                            sender
                        ) ||
                        jidMatch(
                            member?.phoneNumber,
                            sender
                        ) ||
                        jidMatch(
                            member?.id,
                            ctx.message?.key?.participant
                        )
                );

            const isAdmin =
                participant?.admin === "admin" ||
                participant?.admin === "superadmin";

            if (!isAdmin) {

                return ctx.reply(
                    "❌ You must be a group admin to change Anti-Link settings."
                );

            }

        }


        const enabled =
            option === "on";


        groupSettings.set(
            ctx.chat,
            "antilink",
            enabled
        );


        await ctx.reply(

`╭━━━〔 🛡️ ANTI-LINK 〕━━━╮

🔗 Protection

${enabled ? "Enabled" : "Disabled"}

👥 Group

${ctx.groupMetadata?.subject || "Unknown"}

⚡ Changed By

${ctx.sender.split("@")[0]}

━━━━━━━━━━━━━━━━━━

🤖 ${ctx.botName}

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};