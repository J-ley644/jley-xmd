import relationshipStore from "../../system/relationshipStore.js";
import relationshipAnalyzer from "../../system/relationshipAnalyzer.js";
import { jidMatch, getNumberFromJid } from "../../lib/jid.js";


export default {

    name: "ship",

    aliases: [
        "relationship",
        "match",
        "love"
    ],

    category: "fun",

    description:
        "Analyze the relationship between two people in a group.",

    usage:
        ".ship @user1 @user2",

    permissions: {},


    async execute(ctx) {

        /*
        |--------------------------------------------------------------------------
        | Group Only
        |--------------------------------------------------------------------------
        */

        if (!ctx.isGroup) {

            return ctx.reply(
                "❌ The ship command can only be used in groups."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Get Mentions
        |--------------------------------------------------------------------------
        */

        const mentioned =
            ctx.message?.message?.extendedTextMessage
                ?.contextInfo?.mentionedJid || [];


        /*
        |--------------------------------------------------------------------------
        | Also support target/reply
        |--------------------------------------------------------------------------
        */

        const participants = [];


        for (const jid of mentioned) {

            if (
                jid &&
                !participants.some(
                    existing =>
                        jidMatch(existing, jid)
                )
            ) {

                participants.push(jid);

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Reply Target
        |--------------------------------------------------------------------------
        */

        if (
            participants.length < 2 &&
            ctx.isReply
        ) {

            const quotedParticipant =
                ctx.message?.message
                    ?.extendedTextMessage
                    ?.contextInfo
                    ?.participant;


            if (
                quotedParticipant &&
                !participants.some(
                    existing =>
                        jidMatch(
                            existing,
                            quotedParticipant
                        )
                )
            ) {

                participants.push(
                    quotedParticipant
                );

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Command Arguments
        |--------------------------------------------------------------------------
        */

        if (
            participants.length < 2 &&
            ctx.args?.length >= 2
        ) {

            for (
                const arg of ctx.args.slice(0, 2)
            ) {

                const clean =
                    String(arg)
                        .replace(/[<@>]/g, "")
                        .trim();


                if (
                    clean &&
                    !participants.includes(clean)
                ) {

                    participants.push(
                        clean
                    );

                }

            }

        }


        /*
        |--------------------------------------------------------------------------
        | Validation
        |--------------------------------------------------------------------------
        */

        if (participants.length < 2) {

            return ctx.reply(

`╭━━━〔 💘 SHIP 〕━━━╮

Mention two people to analyze their relationship.

Example:

.ship @John @Jane

You can also reply to someone and mention
the second person.

╰━━━━━━━━━━━━━━━━━━╯`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Only Two
        |--------------------------------------------------------------------------
        */

        const first =
            participants[0];

        const second =
            participants[1];


        /*
        |--------------------------------------------------------------------------
        | Prevent Same Person
        |--------------------------------------------------------------------------
        */

        if (
            jidMatch(first, second)
        ) {

            return ctx.reply(
                "😂 You can't ship someone with themselves."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Analyze Relationship
        |--------------------------------------------------------------------------
        */

        let analysis;


        try {

            analysis =
                await relationshipAnalyzer.analyze(
                    ctx,
                    first,
                    second
                );

        } catch (error) {

            console.error(
                "Ship relationship analysis error:",
                error
            );


            /*
            |--------------------------------------------------------------------------
            | Fallback
            |--------------------------------------------------------------------------
            */

            try {

                analysis =
                    relationshipAnalyzer.analyze(
                        ctx,
                        first,
                        second
                    );

            } catch {

                return ctx.reply(
                    "❌ I couldn't analyze their relationship right now."
                );

            }

        }


        if (!analysis) {

            return ctx.reply(
                "❌ No relationship data could be generated."
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Store Result
        |--------------------------------------------------------------------------
        */

        try {

            relationshipStore.update?.(
                ctx.chat,
                first,
                second,
                analysis
            );

        } catch {

            /*
             * Relationship storage should never
             * prevent the command from responding.
             */

        }


        /*
        |--------------------------------------------------------------------------
        | Names
        |--------------------------------------------------------------------------
        */

        const firstName =
            getDisplayName(
                ctx,
                first
            );


        const secondName =
            getDisplayName(
                ctx,
                second
            );


        /*
        |--------------------------------------------------------------------------
        | Scores
        |--------------------------------------------------------------------------
        */

        const romance =
            clampScore(
                analysis.romance ??
                analysis.love ??
                analysis.romanceScore ??
                0
            );


        const friendship =
            clampScore(
                analysis.friendship ??
                analysis.friendshipScore ??
                0
            );


        const enmity =
            clampScore(
                analysis.enmity ??
                analysis.enemy ??
                analysis.enmityScore ??
                0
            );


        /*
        |--------------------------------------------------------------------------
        | Relationship Type
        |--------------------------------------------------------------------------
        */

        const relationship =
            determineRelationship(
                romance,
                friendship,
                enmity
            );


        /*
        |--------------------------------------------------------------------------
        | Compatibility
        |--------------------------------------------------------------------------
        */

        const compatibility =
            calculateCompatibility(
                romance,
                friendship,
                enmity
            );


        /*
        |--------------------------------------------------------------------------
        | Dynamic Commentary
        |--------------------------------------------------------------------------
        */

        const joke =
            generateJoke(
                romance,
                friendship,
                enmity,
                firstName,
                secondName
            );


        /*
        |--------------------------------------------------------------------------
        | Interaction Data
        |--------------------------------------------------------------------------
        */

        const interactions =
            analysis.interactions ??
            analysis.interactionCount ??
            analysis.messageCount ??
            null;


        const interactionLine =
            interactions !== null
                ? `💬 Interactions: ${interactions}`
                : "";


        /*
        |--------------------------------------------------------------------------
        | Final Response
        |--------------------------------------------------------------------------
        */

        return ctx.reply(

`╭━━━〔 💘 RELATIONSHIP ANALYSIS 〕━━━╮

👤 ${firstName}
❤️
👤 ${secondName}

━━━━━━━━━━━━━━━━━━━━

❤️ Romance
${makeBar(romance)} ${romance}%

🤝 Friendship
${makeBar(friendship)} ${friendship}%

⚔️ Enmity
${makeBar(enmity)} ${enmity}%

━━━━━━━━━━━━━━━━━━━━

💞 Compatibility:
${makeBar(compatibility)} ${compatibility}%

🔎 Relationship:
${relationship}

${interactionLine}

${joke}

╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

        );

    }

};


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/


function clampScore(value) {

    const number =
        Number(value);


    if (
        !Number.isFinite(number)
    ) {

        return 0;

    }


    return Math.max(
        0,
        Math.min(
            100,
            Math.round(number)
        )
    );

}


function makeBar(score) {

    const filled =
        Math.round(
            score / 10
        );


    return (
        "█".repeat(filled) +
        "░".repeat(10 - filled)
    );

}


function calculateCompatibility(
    romance,
    friendship,
    enmity
) {

    /*
     * Romance and friendship increase
     * compatibility.
     *
     * Enmity reduces it.
     */

    return clampScore(
        (
            romance * 0.55 +
            friendship * 0.45 -
            enmity * 0.35
        )
    );

}


function determineRelationship(
    romance,
    friendship,
    enmity
) {

    if (
        enmity >= 80
    ) {

        return "💀 Certified enemies";

    }


    if (
        enmity >= 60
    ) {

        return "⚔️ They definitely have beef";

    }


    if (
        romance >= 85
    ) {

        return "💍 Why are you two still pretending?";

    }


    if (
        romance >= 70
    ) {

        return "❤️ Suspiciously romantic";

    }


    if (
        romance >= 50 &&
        friendship >= 50
    ) {

        return "💕 Besties with suspicious chemistry";

    }


    if (
        friendship >= 80
    ) {

        return "🤝 Extremely close friends";

    }


    if (
        friendship >= 60
    ) {

        return "😎 Good friends";

    }


    if (
        enmity >= 40
    ) {

        return "😤 Complicated relationship";

    }


    return "🫱🏽‍🫲🏾 It's complicated...";

}


function generateJoke(
    romance,
    friendship,
    enmity,
    firstName,
    secondName
) {

    /*
    |--------------------------------------------------------------------------
    | High Romance
    |--------------------------------------------------------------------------
    */

    if (
        romance >= 90
    ) {

        return random([
            `💘 ${firstName} + ${secondName} = just date already 😂`,
            `🚨 At this point even the group knows what's going on 😂`,
            `💍 Somebody hide the wedding planner 😂`,
            `❤️ Stop pretending you're "just friends" 😂`,
            `👀 The chemistry is doing more work than both of you.`
        ]);

    }


    if (
        romance >= 75
    ) {

        return random([
            `👀 Someone needs to make the first move 😂`,
            `💕 This is looking dangerously romantic.`,
            `😂 The group chat is definitely watching this one.`,
            `❤️ There is something suspicious happening here...`,
            `😏 Just date already. I'm tired of analyzing this.`
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | High Enmity
    |--------------------------------------------------------------------------
    */

    if (
        enmity >= 85
    ) {

        return random([
            `☠️ Somebody remove these two from the same group 😂`,
            `🔥 This isn't a relationship. It's a battlefield.`,
            `⚔️ Even WhatsApp is tired of their arguments.`,
            `💀 One more argument and the group becomes a war zone.`
        ]);

    }


    if (
        enmity >= 65
    ) {

        return random([
            `😂 You two need a referee.`,
            `⚔️ The beef is very much alive.`,
            `🔥 Somebody bring popcorn.`,
            `😭 Why do you two fight like this?`
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | Strong Friendship
    |--------------------------------------------------------------------------
    */

    if (
        friendship >= 85
    ) {

        return random([
            `🤝 Real friendship detected.`,
            `😂 These two probably share secrets the admins don't know.`,
            `🔥 Certified besties.`,
            `🫂 That's actually wholesome.`,
            `😎 The duo nobody can separate.`
        ]);

    }


    if (
        friendship >= 65
    ) {

        return random([
            `😎 Solid friendship.`,
            `🤝 You two actually get along.`,
            `😂 Definitely partners in crime.`,
            `🔥 Good vibes detected.`
        ]);

    }


    /*
    |--------------------------------------------------------------------------
    | Mixed
    |--------------------------------------------------------------------------
    */

    if (
        romance >= 50 &&
        enmity >= 50
    ) {

        return random([
            `😂 Love and violence apparently coexist here.`,
            `💀 Are you flirting or fighting?`,
            `❤️⚔️ The chemistry is confusing.`,
            `😭 Somebody explain this relationship.`
        ]);

    }


    return random([
        `🤔 The relationship remains mysterious.`,
        `😂 The data isn't telling me everything.`,
        `👀 Interesting... very interesting.`,
        `🕵️ More interactions are needed.`,
        `📊 The algorithm refuses to take sides.`,
        `😂 Whatever this is, it's definitely something.`,
        `🔮 The relationship crystal ball is confused.`,
        `👀 I'll be watching this storyline.`,
        `🧠 Relationship analysis complete. Emotional damage pending.`,
        `📈 Something is happening here... probably.`
    ]);

}


function random(array) {

    if (
        !Array.isArray(array) ||
        array.length === 0
    ) {

        return "";

    }


    return array[
        Math.floor(
            Math.random() *
            array.length
        )
    ];

}


function getDisplayName(
    ctx,
    jid
) {

    /*
    |--------------------------------------------------------------------------
    | Current Sender
    |--------------------------------------------------------------------------
    */

    if (
        jidMatch(
            jid,
            ctx.sender
        )
    ) {

        return (
            ctx.pushName ||
            getNumberFromJid(jid)
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Group Metadata
    |--------------------------------------------------------------------------
    */

    const participants =
        ctx.groupMetadata
            ?.participants || [];


    const participant =
        participants.find(
            member =>
                jidMatch(
                    member.id,
                    jid
                )
        );


    if (participant) {

        return (
            participant.notify ||
            participant.name ||
            getNumberFromJid(jid)
        );

    }


    return getNumberFromJid(jid);

}