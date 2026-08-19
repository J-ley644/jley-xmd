/**
 * JLEY-XMD Anti-Delete Store
 *
 * Stores recent messages so they can be recovered
 * after WhatsApp deletion/revoke events.
 *
 * History is isolated per deployment.
 */

const histories = new Map();

const settings = new Map();

const MAX_HISTORY = 100;


/*
|--------------------------------------------------------------------------
| Deployment History
|--------------------------------------------------------------------------
*/

function getHistory(deploymentId) {

    const id =
        deploymentId ||
        "main";

    if (!histories.has(id)) {

        histories.set(
            id,
            []
        );

    }

    return histories.get(id);

}


/*
|--------------------------------------------------------------------------
| Settings
|--------------------------------------------------------------------------
*/

export function isEnabled(deploymentId) {

    return (
        settings.get(
            deploymentId || "main"
        ) === true
    );

}


export function setEnabled(
    deploymentId,
    enabled
) {

    settings.set(
        deploymentId || "main",
        Boolean(enabled)
    );

}


/*
|--------------------------------------------------------------------------
| Store Message
|--------------------------------------------------------------------------
*/

export function storeMessage(
    deploymentId,
    message
) {

    if (!message) {
        return;
    }

    const history =
        getHistory(
            deploymentId
        );


    /*
    Prevent duplicate storage
    */

    const messageId =
        message.key?.id;

    if (messageId) {

        const exists =
            history.some(
                item =>
                    item.messageId === messageId
            );

        if (exists) {
            return;
        }

    }


    history.unshift({

        messageId,

        chat:
            message.key?.remoteJid ||
            "",

        sender:
            message.key?.participant ||
            message.key?.remoteJid ||
            "",

        senderName:
            message.pushName ||
            "Unknown",

        message,

        storedAt:
            Date.now(),

        deletedAt:
            null,

        deletedBy:
            null

    });


    /*
    Keep memory bounded.
    */

    if (
        history.length >
        MAX_HISTORY
    ) {

        history.splice(
            MAX_HISTORY
        );

    }

}


/*
|--------------------------------------------------------------------------
| Mark Message Deleted
|--------------------------------------------------------------------------
*/

export function markDeleted(
    deploymentId,
    messageId,
    deletedBy
) {

    const history =
        getHistory(
            deploymentId
        );


    const item =
        history.find(
            entry =>
                entry.messageId === messageId
        );


    if (!item) {

        return null;

    }


    item.deletedAt =
        Date.now();


    item.deletedBy =
        deletedBy ||
        "Unknown";


    return item;

}


/*
|--------------------------------------------------------------------------
| Latest Deleted
|--------------------------------------------------------------------------
*/

export function getDeleted(
    deploymentId,
    index = 1
) {

    const history =
        getHistory(
            deploymentId
        );


    const deleted =
        history.filter(
            item =>
                item.deletedAt
        );


    return (
        deleted[index - 1] ||
        null
    );

}


/*
|--------------------------------------------------------------------------
| All Deleted
|--------------------------------------------------------------------------
*/

export function getAllDeleted(
    deploymentId
) {

    const history =
        getHistory(
            deploymentId
        );


    return history.filter(
        item =>
            item.deletedAt
    );

}


/*
|--------------------------------------------------------------------------
| Clear History
|--------------------------------------------------------------------------
*/

export function clearHistory(
    deploymentId
) {

    histories.delete(
        deploymentId || "main"
    );

}


export default {

    isEnabled,

    setEnabled,

    storeMessage,

    markDeleted,

    getDeleted,

    getAllDeleted,

    clearHistory

};