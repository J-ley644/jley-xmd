import {
    isEnabled,
    setEnabled
} from "../../system/antideleteStore.js";

export default {
    name: "antidelete",

    aliases: [
        "ad"
    ],

    category: "antidelete",

    description:
        "Enable or disable automatic deleted-message recovery",

    usage:
        ".antidelete | .antidelete on | .antidelete off",

    permissions: {
        botOwner: true
    },

    async execute(ctx) {

        const args = Array.isArray(ctx.args)
            ? ctx.args
            : [];

        const action = String(
            args[0] || ""
        )
            .trim()
            .toLowerCase();

        /*
        |--------------------------------------------------------------------------
        | Enable
        |--------------------------------------------------------------------------
        */

        if (action === "on") {

            setEnabled(
                ctx.deploymentId,
                true
            );

            return ctx.reply(
                "🛡️ ANTIDELETE ENABLED\n\n" +
                "🟢 Automatic recovery is now ON.\n\n" +
                "Deleted messages will be restored automatically."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Disable
        |--------------------------------------------------------------------------
        */

        if (action === "off") {

            setEnabled(
                ctx.deploymentId,
                false
            );

            return ctx.reply(
                "🛡️ ANTIDELETE DISABLED\n\n" +
                "🔴 Automatic recovery is now OFF.\n\n" +
                "Deleted messages will no longer be restored automatically."
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Status
        |--------------------------------------------------------------------------
        */

        const enabled = isEnabled(
            ctx.deploymentId
        );

        return ctx.reply(
            "🛡️ ANTIDELETE\n\n" +
            `Status: ${enabled ? "🟢 ON" : "🔴 OFF"}\n\n` +
            (
                enabled
                    ? "Deleted messages will be restored automatically."
                    : "Automatic recovery is currently disabled."
            ) +
            "\n\nCommands:\n" +
            `${ctx.prefix}antidelete on\n` +
            `${ctx.prefix}antidelete off\n` +
            `${ctx.prefix}antidelete`
        );
    }
};