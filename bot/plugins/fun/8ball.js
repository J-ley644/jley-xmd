/*
|--------------------------------------------------------------------------
| JLEY-XMD Fun — Magic 8-Ball
|--------------------------------------------------------------------------
|
| Command:
|
|   .8ball <question>
|
| Features:
|   - Large response pool
|   - Multiple response categories
|   - Per-user anti-repeat protection
|   - No external API
|   - Normal user command
|
|--------------------------------------------------------------------------
*/

const RESPONSE_HISTORY_LIMIT = 12;


/*
|--------------------------------------------------------------------------
| Response Pools
|--------------------------------------------------------------------------
*/

const RESPONSES = {

    positive: [

        "Absolutely. ✨",
        "Without a doubt.",
        "Definitely.",
        "The signs point strongly toward yes.",
        "Yes — go for it.",
        "Almost certainly.",
        "The odds look very good.",
        "Everything points to yes.",
        "You can count on it.",
        "The answer is looking very positive.",
        "I'd say yes. 💫",
        "Very likely.",
        "Yes, but don't rush it.",
        "The universe seems to approve.",
        "That's looking like a yes.",
        "All signs point in your favor.",
        "A confident yes.",
        "Yes. Trust the process.",
        "It seems highly possible.",
        "The chances are on your side.",
        "I'd bet on yes.",
        "The outlook is excellent.",
        "Yes — keep moving forward.",
        "Looks promising.",
        "The answer leans strongly toward yes."

    ],


    negative: [

        "Very unlikely.",
        "Don't count on it.",
        "The signs point toward no.",
        "Probably not.",
        "I'd say no.",
        "The odds aren't looking good.",
        "Not this time.",
        "The outlook isn't promising.",
        "The answer leans toward no.",
        "I'd reconsider that.",
        "The universe says no. 😭",
        "That's looking doubtful.",
        "The chances seem pretty low.",
        "Not likely.",
        "The signs aren't in your favor.",
        "I'd avoid betting on it.",
        "The answer is probably no.",
        "Things aren't pointing that way.",
        "I wouldn't rely on it.",
        "The odds are against you.",
        "Probably best to leave that one alone.",
        "The outlook is unfavorable.",
        "Not looking good right now.",
        "I'd prepare for a no.",
        "That's a hard maybe leaning toward no."

    ],


    uncertain: [

        "Ask again later.",
        "Too early to tell.",
        "The answer is unclear.",
        "The signs are mixed.",
        "I can't see the outcome yet.",
        "The future is undecided.",
        "There's not enough information.",
        "Maybe. The universe is being mysterious.",
        "The answer is hiding somewhere.",
        "I'm not sure about this one.",
        "The situation could go either way.",
        "Wait and see.",
        "The outcome hasn't been decided.",
        "The signs are strangely quiet.",
        "I need more cosmic information.",
        "The future refuses to cooperate.",
        "It's too close to call.",
        "The answer is still forming.",
        "Could go either way.",
        "The crystal ball is foggy.",
        "The universe hasn't made up its mind.",
        "That's a complicated one.",
        "The answer is currently classified.",
        "Try again when the stars align.",
        "I genuinely can't tell."

    ],


    funny: [

        "Even I don't know. 😭",
        "That's above my pay grade.",
        "My crystal ball needs Wi-Fi.",
        "The universe left me on read.",
        "Ask your ancestors. 😂",
        "My magic 8-ball is buffering...",
        "The answer escaped.",
        "I asked the universe. It said 'bro, chill.'",
        "My crystal ball just crashed.",
        "The spirits are currently unavailable.",
        "I'm getting mixed signals... literally.",
        "The universe said 'maybe tomorrow.'",
        "I would tell you, but the answer is shy.",
        "My prediction license has expired.",
        "Even the stars are confused.",
        "The cosmic network is experiencing downtime.",
        "I consulted absolutely nobody and they agree.",
        "The answer is hiding under the bed.",
        "My crystal ball needs a software update.",
        "The prophecy has been delayed.",
        "The universe is typing...",
        "I asked fate. Fate said 'figure it out yourself.'",
        "That's classified information. 🤫",
        "The answer has gone on vacation.",
        "My magic powers are taking lunch."

    ]

};


/*
|--------------------------------------------------------------------------
| Build Response Pool
|--------------------------------------------------------------------------
*/

const ALL_RESPONSES = Object.values(
    RESPONSES
).flat();


/*
|--------------------------------------------------------------------------
| Per-User Response History
|--------------------------------------------------------------------------
|
| Stored only in memory.
|
| This prevents the same user from repeatedly receiving
| the same answers during the bot process lifetime.
|
|--------------------------------------------------------------------------
*/

const responseHistory = new Map();


/*
|--------------------------------------------------------------------------
| Random Integer
|--------------------------------------------------------------------------
*/

function randomInt(max) {

    return Math.floor(
        Math.random() * max
    );

}


/*
|--------------------------------------------------------------------------
| Get User History
|--------------------------------------------------------------------------
*/

function getHistory(user) {

    if (!responseHistory.has(user)) {

        responseHistory.set(
            user,
            []
        );

    }

    return responseHistory.get(user);

}


/*
|--------------------------------------------------------------------------
| Pick Response
|--------------------------------------------------------------------------
*/

function pickResponse(user) {

    const history =
        getHistory(user);


    /*
    |--------------------------------------------------------------------------
    | Build candidates
    |--------------------------------------------------------------------------
    */

    let candidates =
        ALL_RESPONSES.filter(
            response =>
                !history.includes(response)
        );


    /*
    |--------------------------------------------------------------------------
    | Safety fallback
    |--------------------------------------------------------------------------
    |
    | If the history somehow contains the entire pool,
    | start a fresh cycle.
    |
    |--------------------------------------------------------------------------
    */

    if (!candidates.length) {

        history.length = 0;

        candidates =
            [...ALL_RESPONSES];

    }


    /*
    |--------------------------------------------------------------------------
    | Pick Random Response
    |--------------------------------------------------------------------------
    */

    const response =
        candidates[
            randomInt(
                candidates.length
            )
        ];


    /*
    |--------------------------------------------------------------------------
    | Save History
    |--------------------------------------------------------------------------
    */

    history.push(
        response
    );


    /*
    |--------------------------------------------------------------------------
    | Limit History
    |--------------------------------------------------------------------------
    */

    while (
        history.length >
        RESPONSE_HISTORY_LIMIT
    ) {

        history.shift();

    }


    return response;

}


/*
|--------------------------------------------------------------------------
| Plugin
|--------------------------------------------------------------------------
*/

export default {

    name: "8ball",

    aliases: [
        "8-ball",
        "magic8",
        "magicball"
    ],

    category: "fun",

    description:
        "Ask the Magic 8-Ball a question.",

    usage:
        ".8ball <question>",

    permissions: {},


    async execute(ctx) {

        const question =
            String(
                ctx.args?.join(" ") || ""
            ).trim();


        /*
        |--------------------------------------------------------------------------
        | Question Required
        |--------------------------------------------------------------------------
        */

        if (!question) {

            return ctx.reply(

`╭━━━〔 🎱 MAGIC 8-BALL 〕━━━╮
│
│ Ask me a yes/no question.
│
│ Example:
│ .8ball will I become successful?
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

            );

        }


        /*
        |--------------------------------------------------------------------------
        | Identify User
        |--------------------------------------------------------------------------
        */

        const user =
            ctx.sender ||
            ctx.number ||
            "unknown";


        /*
        |--------------------------------------------------------------------------
        | Generate Answer
        |--------------------------------------------------------------------------
        */

        const answer =
            pickResponse(
                user
            );


        /*
        |--------------------------------------------------------------------------
        | Reply
        |--------------------------------------------------------------------------
        */

        return ctx.reply(

`╭━━━〔 🎱 MAGIC 8-BALL 〕━━━╮
│
│ ❓ ${question}
│
│ 🔮 ${answer}
│
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯`

        );

    }

};