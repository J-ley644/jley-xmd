/**
 * JLEY-XMD Permission System
 * --------------------------
 * Handles command permission checks.
 */

import config from "../config/config.js";
import { jidMatch } from "./jid.js";


export function isOwner(ctx) {

    return (
        jidMatch(
            ctx.sender,
            config.owner.number
        )
        ||
        jidMatch(
            ctx.sender,
            config.owner.lid
        )
    );

}


export default function checkPermissions(ctx, command) {

    const permissions =
        command.permissions || {};


    // Owner only
    if (permissions.owner) {

        if (!isOwner(ctx)) {

            return "❌ This command is only available to the bot owner.";

        }

    }


    // Group only
    if (permissions.group && !ctx.isGroup) {

        return "❌ This command can only be used in groups.";

    }


    // Private only
    if (permissions.private && ctx.isGroup) {

        return "❌ This command can only be used in private chats.";

    }


    // Group admin
    if (permissions.admin && !ctx.isAdmin) {

        return "❌ You must be a group admin to use this command.";

    }


    // Bot admin
    if (permissions.botAdmin && !ctx.isBotAdmin) {

        return "❌ I need admin rights to use this command.";

    }


    return null;

}