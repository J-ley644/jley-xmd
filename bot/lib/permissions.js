/**

* JLEY-XMD Permission System
* ---
* 
* Permission levels:
* 
* JLEY Owner
* - Platform owner
* - Has unrestricted access to every command
* 
* Bot Owner
* - WhatsApp account running THIS deployment
* - Can use commands requiring botOwner
* 
* Group Admin
* - WhatsApp group administrator
* 
* User
* - Normal command access
    */

import config from "../config/config.js";
import { jidMatch } from "./jid.js";

/*
|--------------------------------------------------------------------------

IDENTITY HELPERS

|
| WhatsApp can expose the same user through two identities:
|
|   ctx.sender
|   ctx.senderAlt
|
| We must check BOTH identities when determining ownership.
|
*/

function getSenderIdentities(ctx) {

return [
    ctx?.sender,
    ctx?.senderAlt
].filter(Boolean);

}

/*
|--------------------------------------------------------------------------

JLEY OWNER

|
| The overall owner of the JLEY-XMD platform.
|
| This is configured globally and is NOT tied to a specific deployment.
|
*/

export function isJleyOwner(ctx) {

const senders =
    getSenderIdentities(ctx);

if (!senders.length) {

    return false;

}

const ownerIdentities = [
    config.owner?.number,
    config.owner?.lid
].filter(Boolean);

return senders.some(sender =>
    ownerIdentities.some(owner =>
        jidMatch(
            sender,
            owner
        )
    )
);

}

/*
|--------------------------------------------------------------------------

BOT OWNER

|
| The WhatsApp account running THIS specific bot deployment.
|
| We compare the command sender against BOTH identities of the
| WhatsApp account currently running the deployment:
|
|   client.user.id
|   client.user.lid
|
*/

export function isBotOwner(ctx) {

const senders =
    getSenderIdentities(ctx);

if (
    !senders.length ||
    !ctx?.client
) {

    return false;

}

const botIdentities = [
    ctx.client.user?.id,
    ctx.client.user?.lid
].filter(Boolean);

return senders.some(sender =>
    botIdentities.some(botIdentity =>
        jidMatch(
            sender,
            botIdentity
        )
    )
);

}

/*
|--------------------------------------------------------------------------

PERMISSION CHECK
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
| BOT OWNER OR JLEY DEVELOPER
|--------------------------------------------------------------------------
|
| Commands marked:
|
|     botOwnerOrJleyOwner: true
|
| are available to either the deployment owner
| or the JLEY developer.
|
*/

if (permissions.botOwnerOrJleyOwner) {

    if (
        !isBotOwner(ctx) &&
        !isJleyOwner(ctx)
    ) {

        return (
            "❌ This command is only available to the bot owner or JLEY developer."
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