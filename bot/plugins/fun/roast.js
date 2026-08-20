const roasts = [

    "You're not stupid. You just have incredibly bad timing with your thoughts.",

    "I'd explain it to you, but I left my crayons at home.",

    "You're the human version of a loading screen.",

    "Your confidence is impressive considering the evidence.",

    "You're not the main character. You're barely in the deleted scenes.",

    "If common sense were currency, you'd be permanently broke.",

    "You're proof that autocorrect can't fix everything.",

    "I've seen Wi-Fi with a stronger connection than your thoughts.",

    "You bring everyone so much joy... especially when you leave.",

    "You're not difficult to understand. You're just difficult to take seriously.",

    "Your brain has an impressive talent for choosing the worst possible option.",

    "You're like a software update nobody asked for and somehow everything got worse.",

    "You have the rare ability to turn a simple question into a three-part documentary.",

    "You're not chaotic. You're just poorly organized confusion.",

    "If bad decisions were an Olympic sport, you'd have sponsorships.",

    "You're living proof that confidence doesn't require qualifications.",

    "Your logic took a wrong turn and never came back.",

    "You have the energy of someone who clicks 'Remind me tomorrow' for six months.",

    "You're like a password nobody can remember: unnecessarily complicated and still useless.",

    "I've met loading bars with more progress than you.",

    "You're not late. Time just gave up waiting for you.",

    "Your ideas have a fascinating habit of arriving already broken.",

    "You're the reason instructions come with pictures.",

    "If thinking were cardio, you'd still be sitting down.",

    "You could get lost in a straight line.",

    "You're not unpredictable. You're consistently making the wrong prediction.",

    "Your attention span has the commitment level of a free trial.",

    "You have two speeds: confused and confidently confused.",

    "You make simple things look like advanced engineering.",

    "Your decision-making process deserves its own warning label.",

    "You're like a group project where everyone else is doing the work.",

    "You don't need enemies. Your choices are doing enough already.",

    "You're not unlucky. You just keep giving bad ideas a second chance.",

    "You have the remarkable ability to miss the point while standing directly on it.",

    "Your brain is running on airplane mode.",

    "You're basically a typo with Wi-Fi.",

    "You bring 'I'll figure it out later' energy to absolutely everything.",

    "You could lose an argument with yourself and still ask for a rematch.",

    "You're the reason screenshots exist.",

    "Your plans have more plot holes than a bad movie.",

    "You're not overthinking. You're professionally thinking in circles.",

    "If excuses were achievements, you'd be legendary.",

    "You have the confidence of a genius and the evidence of a potato.",

    "You're like a notification from an app I forgot I installed.",

    "Your brain really said, 'Let's improvise,' and never stopped.",

    "You make being wrong look like a full-time profession.",

    "Your common sense is currently experiencing technical difficulties.",

    "You're not a disaster. You're a recurring event.",

    "Your greatest skill is making people ask, 'How did we get here?'",

    "You're the plot twist nobody requested.",

    "You have the survival instincts of a phone at 1% battery.",

    "Your personality has more bugs than a beta release.",

    "You're like a broken calculator: technically present, rarely useful.",

    "You somehow manage to lose arguments before they even start.",

    "You have the strategic thinking of someone playing chess with checkers.",

    "You're not running out of ideas. You ran out of good ones years ago.",

    "Your brain treats common sense like an optional subscription.",

    "You're the type to read 'Do not touch' and immediately develop curiosity.",

    "You could turn a shortcut into a three-hour journey.",

    "Your life doesn't need a plot twist. It needs a patch update.",

    "You're like a badly written character: somehow still here despite every decision.",

    "Your confidence needs a reality check more than your phone needs a charger.",

    "You have an impressive ability to make silence feel productive.",

    "You don't miss opportunities. You give them directions to someone else.",

    "You're the reason some people double-check everything.",

    "If your thoughts were a browser, every tab would be frozen.",

    "You're not the sharpest tool in the shed, but at least you're entertaining.",

    "You have the emotional stability of a shopping cart with one broken wheel.",

    "You're like a mystery novel where nobody wants to know the ending.",

    "Your brain's terms and conditions were never accepted.",

    "You have the precision of a coin toss in a hurricane.",

    "You're basically a human pop-up ad.",

    "You don't need Google. You need supervision.",

    "Your train of thought has been cancelled due to technical difficulties.",

    "You're not behind the curve. You missed the entire graph.",

    "Your ideas arrive with confidence and leave with evidence.",

    "You have the problem-solving skills of a cat staring at a closed door.",

    "You're like a low-battery warning: stressful, repetitive, and somehow always appearing at the worst time.",

    "Your brain has excellent storage. Unfortunately, the useful files are missing.",

    "You're not difficult. You're an optional boss fight.",

    "You have enough confidence to power a city and enough logic to turn off the lights.",

    "You're the human equivalent of 'Are you sure you want to continue?'",

    "You don't need a comeback. Your previous decisions already roasted you.",

    "Your thoughts move like a queue at a government office.",

    "You're not a red flag. You're the entire warning screen.",

    "Your personality has been buffering since childhood.",

    "You're the reason people say, 'Well, that escalated quickly.'",

    "You could make a GPS question its career.",

    "Your logic has more detours than a Nairobi road during rush hour.",

    "You're basically an unfinished draft that gained confidence.",

    "Your brain has a fantastic spam filter. Unfortunately, it keeps deleting the good ideas.",

    "You have the timing of a comedian who forgot the punchline.",

    "You're not useless. You can always serve as a bad example.",

    "You're like a tutorial nobody finished reading.",

    "Your plans have the structural integrity of wet tissue paper.",

    "You somehow make chaos look organized and organization look chaotic.",

    "Your biggest achievement today was surviving your own decision-making.",

    "You're not a problem solver. You're a problem multiplier.",

    "You have the confidence of someone who has never checked their own work.",

    "If self-sabotage were a career, you'd be senior management.",

    "You're the kind of person who could press the elevator button twice and feel like you helped.",

    "Your brain really said 'close enough' and submitted the final version.",

    "You're not dumb. You're just aggressively committed to bad ideas.",

    "You have unlimited potential, mostly because nobody has figured out what you're actually good at yet."

];


let lastIndex = -1;


function getRandomRoast() {

    if (roasts.length <= 1) {

        return roasts[0];

    }


    let index;

    do {

        index =
            Math.floor(
                Math.random() * roasts.length
            );

    } while (
        index === lastIndex
    );


    lastIndex = index;

    return roasts[index];

}


export default {

    name: "roast",

    aliases: [
        "roastme"
    ],

    category: "fun",

    description:
        "Get a savage random roast",

    usage:
        ".roast",

    async execute(ctx) {

        const roast =
            getRandomRoast();


        return ctx.reply(

`╭━━━〔 🔥 ROAST 〕━━━╮

${roast}

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};
