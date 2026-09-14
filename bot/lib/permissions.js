import {
    isJleyOwnerIdentity,
    isDeploymentOwner,
    isBotAccount
} from "../system/identity.js";


/**
 * Permanent JLEY developer.
 */
export function isJleyOwner(ctx) {

    return isJleyOwnerIdentity(ctx);

}


/**
 * Owner of the current dashboard deployment.
 */
export function isBotOwner(ctx) {

    return isDeploymentOwner(ctx);

}


/**
 * Either the deployment owner or
 * the permanent JLEY developer.
 */
export function isOwner(ctx) {

    return (
        isJleyOwner(ctx) ||
        isBotOwner(ctx)
    );

}


/**
 * WhatsApp account running the bot.
 *
 * Kept separately because being the bot's
 * WhatsApp account is NOT the same thing as
 * being the deployment owner.
 */
export function isBotAccountOwner(ctx) {

    return isBotAccount(ctx);

}


/**
 * Central permission checker.
 */
export default function checkPermissions(
    ctx,
    command
) {

    const permissions =
        command?.permissions || {};


    /*
     * JLEY developer only.
     */
    if (
        permissions.jleyOwner &&
        !isJleyOwner(ctx)
    ) {

        return (
            "❌ This command is only available " +
            "to the JLEY developer."
        );

    }


    /*
     * Deployment owner only.
     *
     * This now uses the deployment owner's
     * WhatsApp identity instead of assuming
     * the bot's own WhatsApp account is the owner.
     */
    if (
        permissions.botOwner &&
        !isBotOwner(ctx)
    ) {

        return (
            "❌ This command is only available " +
            "to the bot owner."
        );

    }


    /*
     * Deployment owner OR JLEY developer.
     */
    if (
        permissions.botOwnerOrJleyOwner &&
        !isOwner(ctx)
    ) {

        return (
            "❌ This command is only available " +
            "to the bot owner or JLEY developer."
        );

    }


    /*
     * Legacy owner permission.
     *
     * "owner" continues to mean deployment owner.
     */
    if (
        permissions.owner &&
        !isBotOwner(ctx)
    ) {

        return (
            "❌ This command is only available " +
            "to the bot owner."
        );

    }


    /*
     * Group-only command.
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
     * Private-chat-only command.
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
     * Group admin command.
     *
     * Deployment owner and JLEY developer
     * bypass normal group-admin requirements.
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
     * Bot-admin command.
     *
     * Deployment owner and JLEY developer
     * bypass the bot-admin requirement.
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