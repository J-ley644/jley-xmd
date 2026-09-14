/**
 * JLEY-XMD Permission System
 *
 * Permission levels:
 *
 * JLEY Owner
 * - Permanent JLEY-XMD developer
 * - Global access
 *
 * Bot Owner
 * - Owner of the WhatsApp account running this deployment
 *
 * Deployment Owner
 * - Dashboard user who owns the deployment
 *
 * Group Admin
 * - WhatsApp group administrator
 */

import {
    isJleyOwnerIdentity,
    isBotAccount
} from "../system/identity.js";


/**
 * JLEY platform owner.
 */
export function isJleyOwner(ctx) {

    return isJleyOwnerIdentity(ctx);

}


/**
 * Bot account owner.
 *
 * This is the WhatsApp account actually running
 * the current deployment.
 */
export function isBotOwner(ctx) {

    return isBotAccount(ctx);

}


/**
 * Combined owner check.
 *
 * Used where either the JLEY developer or
 * deployment/bot owner should have access.
 */
export function isOwner(ctx) {

    return (
        isJleyOwner(ctx) ||
        isBotOwner(ctx)
    );

}


/**
 * Permission checker.
 */
export default function checkPermissions(
    ctx,
    command
) {

    const permissions =
        command?.permissions || {};


    /*
     * JLEY developer always has access.
     */
    if (
        permissions.jleyOwner &&
        !isJleyOwner(ctx)
    ) {

        return (
            "❌ This command is only available to the JLEY developer."
        );

    }


    /*
     * Bot owner.
     */
    if (
        permissions.botOwner &&
        !isBotOwner(ctx)
    ) {

        return (
            "❌ This command is only available to the bot owner."
        );

    }


    /*
     * Either bot owner or JLEY developer.
     */
    if (
        permissions.botOwnerOrJleyOwner &&
        !isOwner(ctx)
    ) {

        return (
            "❌ This command is only available to the bot owner or JLEY developer."
        );

    }


    /*
     * Legacy owner permission.
     */
    if (
        permissions.owner &&
        !isBotOwner(ctx)
    ) {

        return (
            "❌ This command is only available to the bot owner."
        );

    }


    /*
     * Group.
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
     * Private.
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
     * Group admin.
     */
    if (
        permissions.admin &&
        !ctx.isAdmin &&
        !isOwner(ctx)
    ) {

        return (
            "❌ You must be a group admin to use this command."
        );

    }


    /*
     * Bot admin.
     */
    if (
        permissions.botAdmin &&
        !ctx.isBotAdmin &&
        !isOwner(ctx)
    ) {

        return (
            "❌ I need admin rights to use this command."
        );

    }


    return null;

}