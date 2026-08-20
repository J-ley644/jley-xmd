const questions = [

    "What's the most embarrassing thing you've ever done in public?",

    "What's a secret you've never told your best friend?",

    "What's the last lie you told?",

    "What's the weirdest thing you do when you're alone?",

    "Who was your first crush?",

    "What's the longest you've gone without showering?",

    "What's something you're pretending to understand?",

    "What's the most childish thing you still do?",

    "What's the most embarrassing message you've ever sent?",

    "Have you ever pretended to be busy to avoid someone?",

    "What's your biggest irrational fear?",

    "What's the strangest dream you remember?",

    "What's something you wish you could change about yourself?",

    "Have you ever blamed someone else for something you did?",

    "What's the weirdest food combination you actually enjoy?",

    "What's the last thing you searched for online?",

    "Have you ever laughed at the wrong moment?",

    "What's the most awkward conversation you've ever had?",

    "What's something you secretly judge people for?",

    "Have you ever pretended to know someone you didn't recognize?",

    "What's the most embarrassing nickname you've ever had?",

    "What's something you would never admit to your friends in person?",

    "Have you ever practiced a conversation before actually having it?",

    "What's the dumbest reason you've ever been angry?",

    "What's the most embarrassing autocorrect you've ever sent?",

    "Have you ever stalked someone's social media for way too long?",

    "What's the weirdest thing you've done because you were bored?",

    "What's a habit you wish you could stop?",

    "What's the most embarrassing thing in your search history?",

    "Have you ever pretended to be asleep to avoid talking to someone?",

    "What's the most awkward compliment you've ever received?",

    "What's something you are secretly really good at?",

    "What's something you're terrible at but still pretend you're good at?",

    "Have you ever forgotten someone's name while talking to them?",

    "What's the most ridiculous excuse you've ever used?",

    "What's the longest you've pretended to understand a conversation?",

    "Have you ever sent a message to the wrong person?",

    "What's the funniest misunderstanding you've ever had?",

    "What's something you would buy immediately if money didn't matter?",

    "Have you ever pretended to like something just because someone else liked it?",

    "What's the strangest compliment you've ever given someone?",

    "What's one thing you would change about your past?",

    "Have you ever been caught doing something embarrassing?",

    "What's the most useless talent you have?",

    "What's the weirdest thing you've ever collected?",

    "Have you ever talked to yourself out loud?",

    "What's something you secretly enjoy that others might find weird?",

    "What's the most embarrassing photo of yourself?",

    "Have you ever laughed so hard that you couldn't explain why?",

    "What's the strangest excuse you've heard from someone?",

    "What's one thing you wish people understood about you?",

    "Have you ever pretended to be confident when you were actually nervous?",

    "What's the worst fashion choice you've ever made?",

    "What's the funniest mistake you've ever made?",

    "Have you ever forgotten why you walked into a room?",

    "What's the most awkward thing you've done around someone you liked?",

    "What's something you would never post publicly?",

    "Have you ever accidentally liked an old post while stalking someone?",

    "What's your most embarrassing school memory?",

    "What's the weirdest rumor you've ever heard about yourself?",

    "Have you ever made up an excuse just to leave a conversation?",

    "What's one thing you wish you were better at?",

    "What's the most embarrassing thing you've done because you were nervous?",

    "Have you ever pretended not to see someone you knew?",

    "What's the strangest thing you've ever done at night?",

    "What's something you believed as a child that turned out to be completely wrong?",

    "Have you ever accidentally called someone by the wrong name?",

    "What's your most useless piece of knowledge?",

    "What's the funniest thing you've ever overheard?",

    "Have you ever rehearsed what you were going to say in front of a mirror?",

    "What's something you wish you had started doing earlier?",

    "What's the most awkward first impression you've ever made?",

    "Have you ever pretended to be an expert on something you knew nothing about?",

    "What's the weirdest thing you've ever done while half-asleep?",

    "What's one thing you're secretly competitive about?",

    "Have you ever laughed at a joke you didn't understand?",

    "What's the most ridiculous thing you've ever argued about?",

    "What's something you would never tell your parents?",

    "What's the funniest excuse you've ever used to cancel plans?"

];


/*
|--------------------------------------------------------------------------
| Random Question
|--------------------------------------------------------------------------
|
| Avoid immediately repeating the same question.
|
*/

let lastIndex = -1;


function getRandomQuestion() {

    if (questions.length <= 1) {

        return questions[0];

    }


    let index;

    do {

        index =
            Math.floor(
                Math.random() * questions.length
            );

    } while (
        index === lastIndex
    );


    lastIndex = index;

    return questions[index];

}


export default {

    name: "truth",

    aliases: [
        "truthgame"
    ],

    category: "fun",

    description:
        "Get a random truth question",

    usage:
        ".truth",

    async execute(ctx) {

        const question =
            getRandomQuestion();


        return ctx.reply(

`╭━━━〔 🎯 TRUTH 〕━━━╮

${question}

╰━━━━━━━━━━━━━━━━━━━╯`

        );

    }

};