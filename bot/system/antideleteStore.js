/**
 * JLEY-XMD Anti-Delete Store
 * --------------------------
 * Bounded in-memory message history.
 *
 * Stores only recent messages while anti-delete is enabled.
 * History is isolated per deployment.
 */

const histories = new Map();
const settings = new Map();

/*
|--------------------------------------------------------------------------
| Memory Limits
|--------------------------------------------------------------------------
|
| Keep these deliberately conservative.
|
*/

const MAX_HISTORY = 30;

// Messages older than this are no longer useful for recovery.
const MAX_AGE_MS =
    30 * 60 * 1000;


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
| Cleanup
|--------------------------------------------------------------------------
*/

function cleanupHistory(
    deploymentId
) {

    const history =
        getHistory(
            deploymentId
        );

    const cutoff =
        Date.now() -
        MAX_AGE_MS;


    /*
    Remove expired messages.
    */

    for (
        let index = history.length - 1;
        index >= 0;
        index--
    ) {

        if (
            history[index].storedAt <
            cutoff
        ) {

            history.splice(
                index,
                1
            );

        }

    }


    /*
    Enforce hard count limit.
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
| Settings
|--------------------------------------------------------------------------
*/

export function isEnabled(
    deploymentId
) {

    return (
        settings.get(
            deploymentId ||
            "main"
        ) === true
    );

}


export function setEnabled(
    deploymentId,
    enabled
) {

    const id =
        deploymentId ||
        "main";


    settings.set(
        id,
        Boolean(enabled)
    );


    /*
    When anti-delete is disabled,
    immediately release its stored history.
    */

    if (!enabled) {

        histories.delete(
            id
        );

    }

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


    /*
    Never store anything if the
    feature is disabled.
    */

    if (
        !isEnabled(
            deploymentId
        )
    ) {

        return;

    }


    const history =
        getHistory(
            deploymentId
        );


    /*
    Remove old entries before
    adding another message.
    */

    cleanupHistory(
        deploymentId
    );


    /*
    Prevent duplicates.
    */

    const messageId =
        message.key?.id;


    if (messageId) {

        const exists =
            history.some(
                item =>
                    item.messageId ===
                    messageId
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
    Hard memory ceiling.
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

    cleanupHistory(
        deploymentId
    );


    const history =
        getHistory(
            deploymentId
        );


    const item =
        history.find(
            entry =>
                entry.messageId ===
                messageId
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

    cleanupHistory(
        deploymentId
    );


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

    cleanupHistory(
        deploymentId
    );


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
        deploymentId ||
        "main"
    );

}


/*
|--------------------------------------------------------------------------
| Default Export
|--------------------------------------------------------------------------
*/

export default {

    isEnabled,

    setEnabled,

    storeMessage,

    markDeleted,

    getDeleted,

    getAllDeleted,

    clearHistory

};