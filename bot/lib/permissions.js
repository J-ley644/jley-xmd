/**
 * JLEY-XMD Permission System
 * --------------------------
 *
 * Permission levels:
 *
 * JLEY Owner
 *   - Platform owner
 *   - Has unrestricted access to every command
 *
 * Bot Owner
 *   - WhatsApp account running THIS deployment
 *   - Can use commands requiring botOwner
 *
 * Group Admin
 *   - WhatsApp group administrator
 *
 * User
 *   - Normal command access
 */

import config from "../config/config.js";
import { jidMatch } from "./jid.js";


/*
|--------------------------------------------------------------------------
| JLEY OWNER
|--------------------------------------------------------------------------
|
| The overall owner of the JLEY-XMD platform.
|
| This is configured globally and is NOT tied to a specific deployment.
|
*/

export function isJleyOwner(ctx) {

    if (!ctx?.sender) {

        return false;

    }

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


/*
|--------------------------------------------------------------------------
| BOT OWNER
|--------------------------------------------------------------------------
|
| The WhatsApp account running THIS specific bot deployment.
|
| We compare the command sender against:
|
|   client.user.id
|   client.user.lid
|
*/

export function isBotOwner(ctx) {

    if (!ctx?.sender || !ctx?.client) {

        return false;

    }

    const botPhoneJid =
        ctx.client.user?.id || "";

    const botLid =
        ctx.client.user?.lid || "";

    return (
        jidMatch(
            ctx.sender,
            botPhoneJid
        )
        ||
        jidMatch(
            ctx.sender,
            botLid
        )
    );

}


/*
|--------------------------------------------------------------------------
| PERMISSION CHECK
|--------------------------------------------------------------------------
*/

export default function checkPermissions(
    ctx,
    command
) {

    const permissions =
        command?.permissions || {};


    /*
    |--------------------------------------------------------------------------
    | JLEY OWNER BYPASS
    |--------------------------------------------------------------------------
    |
    | The JLEY platform owner can use EVERYTHING.
    |
    | This check must happen first so that:
    |
    |   group restrictions
    |   admin restrictions
    |   bot-owner restrictions
    |   private restrictions
    |
    | never block JLEY.
    |
    */

    if (isJleyOwner(ctx)) {

        return null;

    }


    /*
    |--------------------------------------------------------------------------
    | BOT OWNER
    |--------------------------------------------------------------------------
    |
    | Commands marked:
    |
    |     botOwner: true
    |
    | are available only to the account running this deployment.
    |
    */

    if (permissions.botOwner) {

        if (!isBotOwner(ctx)) {

            return (
                "❌ This command is only available to the bot owner."
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | LEGACY OWNER SUPPORT
    |--------------------------------------------------------------------------
    |
    | Existing commands using:
    |
    |     owner: true
    |
    | will temporarily behave as bot-owner commands.
    |
    */

    if (permissions.owner) {

        if (!isBotOwner(ctx)) {

            return (
                "❌ This command is only available to the bot owner."
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | JLEY OWNER ONLY
    |--------------------------------------------------------------------------
    |
    | Commands marked:
    |
    |     jleyOwner: true
    |
    | can ONLY be used by the overall JLEY owner.
    |
    */

    if (permissions.jleyOwner) {

        if (!isJleyOwner(ctx)) {

            return (
                "❌ This command is only available to the JLEY owner."
            );

        }

    }


    /*
    |--------------------------------------------------------------------------
    | GROUP ONLY
    |--------------------------------------------------------------------------
    */

    if (
        permissions.group &&
        !ctx.isGroup
    ) {

        return (
            "❌ This command can only be used in groups."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | PRIVATE ONLY
    |--------------------------------------------------------------------------
    */

    if (
        permissions.private &&
        ctx.isGroup
    ) {

        return (
            "❌ This command can only be used in private chats."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | GROUP ADMIN
    |--------------------------------------------------------------------------
    */

    if (
        permissions.admin &&
        !ctx.isAdmin
    ) {

        return (
            "❌ You must be a group admin to use this command."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | BOT ADMIN
    |--------------------------------------------------------------------------
    */

    if (
        permissions.botAdmin &&
        !ctx.isBotAdmin
    ) {

        return (
            "❌ I need admin rights to use this command."
        );

    }


    /*
    |--------------------------------------------------------------------------
    | ALLOWED
    |--------------------------------------------------------------------------
    */

    return null;

}