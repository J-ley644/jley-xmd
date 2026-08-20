import relationshipStore from "./relationshipStore.js";


/*
|--------------------------------------------------------------------------
| Utility
|--------------------------------------------------------------------------
*/

function clamp(
    value,
    min = 0,
    max = 100
) {

    return Math.max(
        min,
        Math.min(
            max,
            Math.round(value)
        )
    );

}


/*
|--------------------------------------------------------------------------
| Safe Number
|--------------------------------------------------------------------------
*/

function number(
    value
) {

    return Number.isFinite(
        Number(value)
    )
        ? Number(value)
        : 0;

}


/*
|--------------------------------------------------------------------------
| Analyze Pair
|--------------------------------------------------------------------------
*/

export function analyzeRelationship(
    deploymentId,
    groupJid,
    userA,
    userB
) {

    const data =
        relationshipStore.getExistingPair(
            deploymentId,
            groupJid,
            userA,
            userB
        );


    /*
    |--------------------------------------------------------------------------
    | No Interaction Data
    |--------------------------------------------------------------------------
    */

    if (!data) {

        return {

            messages: 0,

            replies: 0,

            mentions: 0,

            romance: 0,

            friendship: 0,

            enmity: 0,

            chaos: 0,

            toxicity: 0,

            suspicion: 0,

            closeness: 0,

            type: "unknown",

            confidence: 0

        };

    }


    const messages =
        number(
            data.messages
        );


    const replies =
        number(
            data.replies
        );


    const mentions =
        number(
            data.mentions
        );


    const mutual =
        number(
            data.mutualInteractions
        );


    const positive =
        number(
            data.positiveInteractions
        );


    const negative =
        number(
            data.negativeInteractions
        );


    const teasing =
        number(
            data.teasing
        );


    const argumentsCount =
        number(
            data.arguments
        );


    const reactions =
        number(
            data.reactions
        );


    /*
    |--------------------------------------------------------------------------
    | Interaction Strength
    |--------------------------------------------------------------------------
    */

    const interactionStrength =
        clamp(
            (
                messages * 1.5
            ) +
            (
                replies * 4
            ) +
            (
                mentions * 2
            ) +
            (
                reactions * 1.5
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Friendship
    |--------------------------------------------------------------------------
    */

    const friendship =
        clamp(
            (
                interactionStrength * 0.35
            ) +
            (
                positive * 5
            ) +
            (
                replies * 2
            ) -
            (
                argumentsCount * 1.5
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Enmity
    |--------------------------------------------------------------------------
    */

    const enmity =
        clamp(
            (
                negative * 6
            ) +
            (
                argumentsCount * 8
            ) +
            (
                teasing * 2
            ) -
            (
                positive * 2
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Chaos
    |--------------------------------------------------------------------------
    */

    const chaos =
        clamp(
            (
                teasing * 7
            ) +
            (
                argumentsCount * 5
            ) +
            (
                reactions * 2
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Romance
    |--------------------------------------------------------------------------
    |
    | Romance is intentionally influenced by:
    |
    | - frequent interaction
    | - replies
    | - mentions
    | - positive interaction
    | - mutual engagement
    |
    | It is NOT simply random.
    |
    */

    const romance =
        clamp(
            (
                interactionStrength * 0.28
            ) +
            (
                replies * 4
            ) +
            (
                mentions * 2.5
            ) +
            (
                positive * 5
            ) +
            (
                mutual * 0.15
            ) -
            (
                argumentsCount * 1.5
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Toxicity
    |--------------------------------------------------------------------------
    */

    const toxicity =
        clamp(
            (
                negative * 5
            ) +
            (
                argumentsCount * 9
            ) +
            (
                teasing * 3
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Suspicion
    |--------------------------------------------------------------------------
    */

    const suspicion =
        clamp(
            (
                romance * 0.65
            ) +
            (
                mentions * 2
            ) +
            (
                replies * 2
            ) +
            (
                positive * 3
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Closeness
    |--------------------------------------------------------------------------
    */

    const closeness =
        clamp(
            (
                interactionStrength * 0.45
            ) +
            (
                positive * 3
            ) +
            (
                replies * 2
            )
        );


    /*
    |--------------------------------------------------------------------------
    | Determine Relationship Type
    |--------------------------------------------------------------------------
    */

    const scores = {

        romance,

        friendship,

        enmity,

        chaos,

        toxicity

    };


    const ranked =
        Object.entries(
            scores
        )
            .sort(
                (
                    [, a],
                    [, b]
                ) =>
                    b - a
            );


    const strongestType =
        ranked[0]?.[0] ||
        "unknown";


    /*
    |--------------------------------------------------------------------------
    | Confidence
    |--------------------------------------------------------------------------
    */

    const confidence =
        clamp(
            Math.min(
                100,
                (
                    messages * 2
                ) +
                (
                    replies * 3
                ) +
                (
                    mentions * 2
                )
            )
        );


    return {

        messages,

        replies,

        mentions,

        mutualInteractions:
            mutual,

        positiveInteractions:
            positive,

        negativeInteractions:
            negative,

        teasing,

        arguments:
            argumentsCount,

        reactions,

        romance,

        friendship,

        enmity,

        chaos,

        toxicity,

        suspicion,

        closeness,

        type:
            strongestType,

        confidence

    };

}


/*
|--------------------------------------------------------------------------
| Find Most Interesting Pair
|--------------------------------------------------------------------------
*/

export function findInterestingPair(
    deploymentId,
    groupJid
) {

    const pairs =
        relationshipStore.getAllPairs(
            deploymentId,
            groupJid
        );


    if (!pairs.length) {

        return null;

    }


    const ranked =
        pairs
            .map(pair => {

                const [
                    userA,
                    userB
                ] =
                    pair.key.split("::");


                const analysis =
                    analyzeRelationship(
                        deploymentId,
                        groupJid,
                        userA,
                        userB
                    );


                const interest =
                    Math.max(
                        analysis.romance,
                        analysis.enmity,
                        analysis.chaos,
                        analysis.toxicity,
                        analysis.friendship
                    );


                return {

                    userA,

                    userB,

                    analysis,

                    interest

                };

            })
            .sort(
                (a, b) =>
                    b.interest -
                    a.interest
            );


    return ranked[0] || null;

}


/*
|--------------------------------------------------------------------------
| Get Relationship Label
|--------------------------------------------------------------------------
*/

export function getRelationshipLabel(
    analysis
) {

    if (!analysis) {

        return "Unknown";

    }


    const {

        romance = 0,

        friendship = 0,

        enmity = 0,

        chaos = 0,

        toxicity = 0

    } = analysis;


    if (
        toxicity >= 75 &&
        enmity >= 65
    ) {

        return "toxic";

    }


    if (
        enmity >= 70
    ) {

        return "enmity";

    }


    if (
        romance >= 75
    ) {

        return "romance";

    }


    if (
        chaos >= 75
    ) {

        return "chaos";

    }


    if (
        friendship >= 70
    ) {

        return "friendship";

    }


    if (
        romance >= 55 &&
        friendship >= 55
    ) {

        return "suspicious";

    }


    return "neutral";

}


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default {

    analyzeRelationship,

    findInterestingPair,

    getRelationshipLabel

};