/**
 * JLEY-XMD
 * Set Prefix Command
 *
 * Changes the command prefix for the current deployment.
 */

import automationStore from "../../system/automationStore.js";


export default {

    name: "setprefix",

    aliases: [
        "prefix"
    ],

    category: "owner",

    description:
        "Change the command prefix for this deployment.",

    usage:
        "setprefix <prefix>",

    cooldown: 3,

    permissions: {

        botOwnerOrJleyOwner: true

    },


    async execute(ctx) {

        const prefix =
            ctx.args?.[0];


        /*
        |--------------------------------------------------------------------------
        | Deployment Check
        |--------------------------------------------------------------------------
        */

        const deploymentId =
            ctx.client?.deploymentId;


        if (!deploymentId) {

            return ctx.reply(
                "❌ This command could not determine the current deployment."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Usage Check
        |--------------------------------------------------------------------------
        */

        if (
            !prefix
        ) {

            return ctx.reply(

                `❌ Please provide a prefix.\n\n` +
                `Example: *${ctx.prefix}setprefix !*\n\n` +
                `Current prefix: *${ctx.prefix}*`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Prefix Validation
        |--------------------------------------------------------------------------
        |
        | Prefixes must:
        | - Be a string
        | - Contain no whitespace
        | - Be between 1 and 5 characters
        |
        */

        if (
            typeof prefix !== "string" ||
            prefix.length < 1 ||
            prefix.length > 5 ||
            /\s/.test(prefix)
        ) {

            return ctx.reply(

                "❌ Invalid prefix.\n\n" +
                "The prefix must be 1–5 characters and cannot contain spaces."

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Save Prefix
        |--------------------------------------------------------------------------
        */

        automationStore.set(
            deploymentId,
            "prefix",
            prefix
        );

        ctx.client.commandPrefix = prefix;


        /*
        |--------------------------------------------------------------------------
        | Confirmation
        |--------------------------------------------------------------------------
        */

        return ctx.reply(

            `✅ Command prefix updated successfully.\n\n` +
            `New prefix: *${prefix}*\n\n` +
            `Try: *${prefix}menu*`

        );

    }

};