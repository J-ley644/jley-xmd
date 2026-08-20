import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


/*
|--------------------------------------------------------------------------
| Paths
|--------------------------------------------------------------------------
*/

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


const DATABASE_DIR =
    path.join(
        __dirname,
        "..",
        "database"
    );


const DB_PATH =
    path.join(
        DATABASE_DIR,
        "relationshipData.json"
    );


/*
|--------------------------------------------------------------------------
| Configuration
|--------------------------------------------------------------------------
*/

const MAX_GROUP_PAIRS = 500;

const MAX_RECENT_EVENTS = 40;


/*
|--------------------------------------------------------------------------
| Ensure Database
|--------------------------------------------------------------------------
*/

function ensureDatabase() {

    if (
        !fs.existsSync(
            DATABASE_DIR
        )
    ) {

        fs.mkdirSync(
            DATABASE_DIR,
            {
                recursive: true
            }
        );

    }


    if (
        !fs.existsSync(
            DB_PATH
        )
    ) {

        fs.writeFileSync(
            DB_PATH,
            JSON.stringify(
                {},
                null,
                4
            ),
            "utf8"
        );

    }

}


/*
|--------------------------------------------------------------------------
| Load
|--------------------------------------------------------------------------
*/

function load() {

    ensureDatabase();


    try {

        const content =
            fs.readFileSync(
                DB_PATH,
                "utf8"
            ).trim();


        if (!content) {

            return {};

        }


        const parsed =
            JSON.parse(
                content
            );


        if (
            !parsed ||
            typeof parsed !== "object" ||
            Array.isArray(parsed)
        ) {

            return {};

        }


        return parsed;

    } catch (error) {

        console.error(
            "Relationship database load error:",
            error?.message ||
            error
        );

        return {};

    }

}


/*
|--------------------------------------------------------------------------
| Save
|--------------------------------------------------------------------------
*/

function save(
    data
) {

    ensureDatabase();


    fs.writeFileSync(
        DB_PATH,
        JSON.stringify(
            data,
            null,
            4
        ),
        "utf8"
    );

}


/*
|--------------------------------------------------------------------------
| Empty Pair
|--------------------------------------------------------------------------
*/

function createPair() {

    return {

        messages: 0,

        replies: 0,

        mentions: 0,

        mutualInteractions: 0,

        positiveInteractions: 0,

        negativeInteractions: 0,

        teasing: 0,

        arguments: 0,

        reactions: 0,

        recentEvents: [],

        updatedAt:
            Date.now()

    };

}


/*
|--------------------------------------------------------------------------
| Normalize Pair
|--------------------------------------------------------------------------
*/

function normalizePair(
    a,
    b
) {

    const values = [

        String(
            a || ""
        )
            .trim(),

        String(
            b || ""
        )
            .trim()

    ]
        .filter(Boolean)
        .sort();


    if (
        values.length !== 2 ||
        values[0] === values[1]
    ) {

        return null;

    }


    return (
        `${values[0]}::${values[1]}`
    );

}


/*
|--------------------------------------------------------------------------
| Ensure Group
|--------------------------------------------------------------------------
*/

function ensureGroup(
    db,
    deploymentId,
    groupJid
) {

    if (
        !db[deploymentId]
    ) {

        db[deploymentId] = {};

    }


    if (
        !db[deploymentId][groupJid]
    ) {

        db[deploymentId][groupJid] = {

            pairs: {}

        };

    }


    if (
        !db[deploymentId][groupJid].pairs
    ) {

        db[deploymentId][groupJid].pairs = {};

    }


    return (
        db[
            deploymentId
        ][
            groupJid
        ]
    );

}


/*
|--------------------------------------------------------------------------
| Get Group
|--------------------------------------------------------------------------
*/

function getGroup(
    deploymentId,
    groupJid
) {

    if (
        !deploymentId ||
        !groupJid
    ) {

        return null;

    }


    const db =
        load();


    return ensureGroup(
        db,
        deploymentId,
        groupJid
    );

}


/*
|--------------------------------------------------------------------------
| Get Pair
|--------------------------------------------------------------------------
*/

function getPair(
    deploymentId,
    groupJid,
    userA,
    userB
) {

    const key =
        normalizePair(
            userA,
            userB
        );


    if (!key) {

        return null;

    }


    const db =
        load();


    const group =
        ensureGroup(
            db,
            deploymentId,
            groupJid
        );


    if (
        !group.pairs[key]
    ) {

        group.pairs[key] =
            createPair();


        save(
            db
        );

    }


    return group.pairs[key];

}


/*
|--------------------------------------------------------------------------
| Record Interaction
|--------------------------------------------------------------------------
*/

function recordInteraction(
    deploymentId,
    groupJid,
    userA,
    userB,
    type = "interaction"
) {

    if (
        !deploymentId ||
        !groupJid ||
        !userA ||
        !userB
    ) {

        return null;

    }


    const key =
        normalizePair(
            userA,
            userB
        );


    if (!key) {

        return null;

    }


    const db =
        load();


    const group =
        ensureGroup(
            db,
            deploymentId,
            groupJid
        );


    if (
        !group.pairs[key]
    ) {

        group.pairs[key] =
            createPair();

    }


    const pair =
        group.pairs[key];


    /*
    |--------------------------------------------------------------------------
    | Base Message Interaction
    |--------------------------------------------------------------------------
    |
    | Every real interaction represents one observed
    | message between the pair.
    |
    */

    if (
    type === "interaction"
) {

    pair.messages++;

    pair.mutualInteractions++;

}


    /*
    |--------------------------------------------------------------------------
    | Interaction Characteristics
    |--------------------------------------------------------------------------
    */

    switch (
        String(
            type || "interaction"
        )
            .toLowerCase()
    ) {

        case "reply":

            pair.replies++;

            break;


        case "mention":

            pair.mentions++;

            break;


        case "positive":

            pair.positiveInteractions++;

            break;


        case "negative":

            pair.negativeInteractions++;

            break;


        case "teasing":

            pair.teasing++;

            break;


        case "argument":

            pair.arguments++;

            break;


        case "reaction":

            pair.reactions++;

            break;

    }


    /*
    |--------------------------------------------------------------------------
    | Recent Events
    |--------------------------------------------------------------------------
    */

    if (
        !Array.isArray(
            pair.recentEvents
        )
    ) {

        pair.recentEvents = [];

    }


    pair.recentEvents.push({

        type:
            String(
                type || "interaction"
            )
                .toLowerCase(),

        timestamp:
            Date.now()

    });


    if (
        pair.recentEvents.length >
        MAX_RECENT_EVENTS
    ) {

        pair.recentEvents =
            pair.recentEvents.slice(
                -MAX_RECENT_EVENTS
            );

    }


    pair.updatedAt =
        Date.now();


    /*
    |--------------------------------------------------------------------------
    | Limit Pair Count
    |--------------------------------------------------------------------------
    */

    const pairEntries =
        Object.entries(
            group.pairs
        );


    if (
        pairEntries.length >
        MAX_GROUP_PAIRS
    ) {

        pairEntries
            .sort(
                (
                    [, a],
                    [, b]
                ) =>
                    (
                        a.updatedAt || 0
                    ) -
                    (
                        b.updatedAt || 0
                    )
            )
            .slice(
                0,
                pairEntries.length -
                MAX_GROUP_PAIRS
            )
            .forEach(
                ([oldKey]) => {

                    delete group.pairs[
                        oldKey
                    ];

                }
            );

    }


    /*
    |--------------------------------------------------------------------------
    | Persist
    |--------------------------------------------------------------------------
    */

    save(
        db
    );


    return pair;

}


/*
|--------------------------------------------------------------------------
| Get Existing Pair
|--------------------------------------------------------------------------
*/

function getExistingPair(
    deploymentId,
    groupJid,
    userA,
    userB
) {

    const db =
        load();


    const key =
        normalizePair(
            userA,
            userB
        );


    if (!key) {

        return null;

    }


    return (
        db?.[
            deploymentId
        ]?.[
            groupJid
        ]?.pairs?.[
            key
        ] ||
        null
    );

}


/*
|--------------------------------------------------------------------------
| Get All Pairs
|--------------------------------------------------------------------------
*/

function getAllPairs(
    deploymentId,
    groupJid
) {

    const db =
        load();


    return Object.entries(
        db?.[
            deploymentId
        ]?.[
            groupJid
        ]?.pairs ||
        {}
    )
        .map(
            ([
                key,
                data
            ]) => ({

                key,

                ...data

            })
        );

}


/*
|--------------------------------------------------------------------------
| Remove Old Data
|--------------------------------------------------------------------------
*/

function cleanup(
    maxAgeDays = 30
) {

    const db =
        load();


    const cutoff =
        Date.now() -
        (
            maxAgeDays *
            24 *
            60 *
            60 *
            1000
        );


    let changed = false;


    for (
        const deploymentId
        of Object.keys(db)
    ) {

        for (
            const groupJid
            of Object.keys(
                db[
                    deploymentId
                ] || {}
            )
        ) {

            const group =
                db[
                    deploymentId
                ][
                    groupJid
                ];


            if (
                !group?.pairs
            ) {

                continue;

            }


            for (
                const pairKey
                of Object.keys(
                    group.pairs
                )
            ) {

                const pair =
                    group.pairs[
                        pairKey
                    ];


                if (
                    (
                        pair.updatedAt ||
                        0
                    ) <
                    cutoff
                ) {

                    delete group.pairs[
                        pairKey
                    ];

                    changed = true;

                }

            }

        }

    }


    if (changed) {

        save(
            db
        );

    }


    return changed;

}


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default {

    getGroup,

    getPair,

    getExistingPair,

    getAllPairs,

    recordInteraction,

    cleanup

};