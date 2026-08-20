import relationshipStore from "./relationshipStore.js";
import { jidMatch } from "../lib/jid.js";


/*
|--------------------------------------------------------------------------
| Relationship Tracker
|--------------------------------------------------------------------------
|
| Observes group conversations and builds long-term interaction profiles.
|
*/


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const POSITIVE_PATTERNS = [

    /\b(love|luv|like|adorable|cute|sweet|nice|great|amazing|awesome)\b/i,

    /\b(thanks|thank you|good job|well done|congrats|congratulations)\b/i,

    /[\u{1F602}\u{1F923}\u{1F970}\u{1F618}\u{1F495}\u{1F496}\u{1F497}\u{1F498}\u{1F499}\u{1F49A}\u{1F49B}\u{1F49C}\u{1F49D}\u{1F49E}\u{1F49F}\u{1F525}]/u

];


const NEGATIVE_PATTERNS = [

    /\b(hate|idiot|stupid|dumb|fool|loser|trash|useless)\b/i,

    /\b(shut up|fuck you|go away|get lost)\b/i,

    /[\u{1F92C}\u{1F621}\u{1F620}\u{1F4A2}]/u

];


const TEASING_PATTERNS = [

    /\b(lol|lmao|lmfao|bro|bruh|clown|skill issue)\b/i,

    /[\u{1F602}\u{1F923}\u{1F608}\u{1F480}\u{1F921}]/u

];


const ARGUMENT_PATTERNS = [

    /\b(you're wrong|you are wrong|no you're|no you are|stop lying|liar)\b/i,

    /\b(shut up|fuck off|what the fuck|bullshit)\b/i

];


/*
|--------------------------------------------------------------------------
| Safe Text Extraction
|--------------------------------------------------------------------------
*/

function getText(
    message
) {

    return (

        message?.message?.conversation ||

        message?.message?.extendedTextMessage?.text ||

        message?.message?.imageMessage?.caption ||

        message?.message?.videoMessage?.caption ||

        message?.message?.documentMessage?.caption ||

        ""

    ).trim();

}


/*
|--------------------------------------------------------------------------
| Sender
|--------------------------------------------------------------------------
*/

function getSender(
    message
) {

    return (

        message?.key?.participant ||

        message?.key?.remoteJid ||

        ""

    );

}


/*
|--------------------------------------------------------------------------
| Mentioned Users
|--------------------------------------------------------------------------
*/

function getMentions(
    message
) {

    const content =
        Object.values(
            message?.message || {}
        )[0];


    const mentions =
        content
            ?.contextInfo
            ?.mentionedJid;


    return Array.isArray(
        mentions
    )
        ? mentions.filter(Boolean)
        : [];

}


/*
|--------------------------------------------------------------------------
| Replied User
|--------------------------------------------------------------------------
*/

function getRepliedUser(
    message
) {

    const content =
        Object.values(
            message?.message || {}
        )[0];


    const contextInfo =
        content?.contextInfo;


    if (!contextInfo) {

        return null;

    }


    return (
        contextInfo.participant ||
        null
    );

}


/*
|--------------------------------------------------------------------------
| Reaction Target
|--------------------------------------------------------------------------
*/

function getReactionTarget(
    message
) {

    const content =
        Object.values(
            message?.message || {}
        )[0];


    const reaction =
        content?.reactionMessage;


    if (!reaction) {

        return null;

    }


    return (
        reaction?.key?.participant ||
        reaction?.key?.remoteJid ||
        null
    );

}


/*
|--------------------------------------------------------------------------
| Pattern Detection
|--------------------------------------------------------------------------
*/

function matchesAny(
    text,
    patterns
) {

    return patterns.some(
        pattern =>
            pattern.test(
                text
            )
    );

}


/*
|--------------------------------------------------------------------------
| Track Pair
|--------------------------------------------------------------------------
*/

function trackPair(
    deploymentId,
    groupJid,
    sender,
    target,
    types = []
) {

    if (
        !sender ||
        !target ||
        jidMatch(
            sender,
            target
        )
    ) {

        return;

    }


    /*
     * One base interaction represents
     * one observed message.
     */

    relationshipStore.recordInteraction(
        deploymentId,
        groupJid,
        sender,
        target,
        "interaction"
    );


    /*
     * Additional characteristics do NOT
     * increment the message count.
     */

    for (
        const type of types
    ) {

        relationshipStore.recordInteraction(
            deploymentId,
            groupJid,
            sender,
            target,
            type
        );

    }

}


/*
|--------------------------------------------------------------------------
| Track Message
|--------------------------------------------------------------------------
*/

export function trackMessage(
    client,
    message
) {

    try {

        if (
            !client ||
            !message?.message
        ) {

            return;

        }


        const groupJid =
            message.key?.remoteJid;


        /*
         * Group-only tracking.
         */

        if (
            !groupJid ||
            !groupJid.endsWith(
                "@g.us"
            )
        ) {

            return;

        }


        /*
         * Ignore status.
         */

        if (
            groupJid ===
            "status@broadcast"
        ) {

            return;

        }


        /*
         * Ignore bot messages.
         */

        if (
            message.key?.fromMe
        ) {

            return;

        }


        const sender =
            getSender(
                message
            );


        if (!sender) {

            return;

        }


        const deploymentId =
            client.deploymentId ||
            "main";


        const text =
            getText(
                message
            );


        /*
         * Detect conversational characteristics.
         */

        const positive =
            matchesAny(
                text,
                POSITIVE_PATTERNS
            );


        const negative =
            matchesAny(
                text,
                NEGATIVE_PATTERNS
            );


        const teasing =
            matchesAny(
                text,
                TEASING_PATTERNS
            );


        const argument =
            matchesAny(
                text,
                ARGUMENT_PATTERNS
            );


        /*
         * Build characteristic list.
         */

        const characteristics = [];


        if (positive) {

            characteristics.push(
                "positive"
            );

        }


        if (negative) {

            characteristics.push(
                "negative"
            );

        }


        if (teasing) {

            characteristics.push(
                "teasing"
            );

        }


        if (argument) {

            characteristics.push(
                "argument"
            );

        }


        /*
         |--------------------------------------------------------------------------
         | Reply
         |--------------------------------------------------------------------------
         */

        const replyTarget =
            getRepliedUser(
                message
            );


        if (replyTarget) {

            trackPair(
                deploymentId,
                groupJid,
                sender,
                replyTarget,
                [
                    "reply",
                    ...characteristics
                ]
            );

        }


        /*
         |--------------------------------------------------------------------------
         | Mentions
         |--------------------------------------------------------------------------
         */

        const mentions =
            getMentions(
                message
            );


        for (
            const mentioned of mentions
        ) {

            if (
                jidMatch(
                    sender,
                    mentioned
                )
            ) {

                continue;

            }


            trackPair(
                deploymentId,
                groupJid,
                sender,
                mentioned,
                [
                    "mention",
                    ...characteristics
                ]
            );

        }


        /*
         |--------------------------------------------------------------------------
         | Reaction
         |--------------------------------------------------------------------------
         */

        const reactionTarget =
            getReactionTarget(
                message
            );


        if (reactionTarget) {

            trackPair(
                deploymentId,
                groupJid,
                sender,
                reactionTarget,
                [
                    "reaction"
                ]
            );

        }

    } catch (error) {

        console.error(
            "Relationship tracker error:",
            error?.message ||
            error
        );

    }

}


export default {

    trackMessage

};