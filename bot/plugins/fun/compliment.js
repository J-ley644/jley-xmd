const compliments = [

    "You have the kind of energy that makes people feel comfortable around you.",

    "You make ordinary conversations surprisingly memorable.",

    "There's something genuinely refreshing about the way you think.",

    "You have a presence that's difficult to ignore—in a good way.",

    "You're probably more capable than you give yourself credit for.",

    "You have a talent for making people laugh when they need it.",

    "You bring good energy into rooms without even trying.",

    "You have a personality people can actually remember.",

    "You seem like the kind of person who makes boring days better.",

    "You have an underrated ability to keep going when things get difficult.",

    "You're more interesting than you probably realize.",

    "You have the rare combination of confidence and curiosity.",

    "People probably feel more comfortable around you than you realize.",

    "You have a way of making conversations feel natural.",

    "You're the kind of person people remember after meeting once.",

    "Your sense of humor deserves more credit.",

    "You have a surprisingly strong main-character energy.",

    "You make being yourself look effortless.",

    "You're probably someone's favorite person without knowing it.",

    "You have a way of making people feel heard.",

    "Your personality has more depth than your first impression suggests.",

    "You're the type of person who can turn a bad mood into a good one.",

    "You have good instincts—even when you doubt them.",

    "You bring something unique to every conversation.",

    "You're quietly impressive.",

    "You have the kind of confidence that grows stronger with experience.",

    "You're much harder to replace than you think.",

    "You have a good heart, and it shows more than you realize.",

    "You're someone people can genuinely count on.",

    "You have a way of making people feel welcome.",

    "You have better ideas than you give yourself credit for.",

    "You have the potential to surprise yourself.",

    "You're naturally good at making moments memorable.",

    "Your presence can change the mood of a room.",

    "You have a personality that doesn't need to try too hard.",

    "You seem like someone who learns from mistakes instead of letting them define you.",

    "You have a strong sense of individuality.",

    "You're the kind of person who can make someone smile without realizing it.",

    "You have more patience than most people notice.",

    "Your creativity is seriously underrated.",

    "You have a good balance of humor and seriousness.",

    "You're more resilient than your difficult days suggest.",

    "You have the ability to make people feel included.",

    "You're the kind of person who can make a simple story entertaining.",

    "You have a natural ability to adapt.",

    "You have a style that's distinctly your own.",

    "You're probably better at handling pressure than you think.",

    "You have a way of finding opportunities where other people see problems.",

    "You're someone who can make progress even when the path isn't obvious.",

    "You have a quietly confident vibe.",

    "You're more memorable than you realize.",

    "You have an excellent sense of timing when it comes to humor.",

    "You make complicated things seem less intimidating.",

    "You have the kind of personality that gets better the longer someone knows you.",

    "You deserve more credit for the things you've already accomplished.",

    "You're capable of more than your current circumstances might suggest.",

    "You have a surprisingly strong ability to bounce back.",

    "You make people curious to hear what you'll say next.",

    "You're not ordinary, and that's probably your biggest advantage.",

    "You have a natural ability to make people feel appreciated.",

    "Your curiosity is one of your best qualities.",

    "You have a good instinct for knowing when someone needs encouragement.",

    "You're the kind of person who can make a group conversation better.",

    "You have a memorable sense of humor.",

    "You bring personality to even the simplest things.",

    "You have a strong presence without needing to demand attention.",

    "You have a lot of untapped potential.",

    "You have the ability to turn setbacks into lessons.",

    "You're probably more inspiring to people around you than you realize.",

    "You have a genuinely interesting perspective on things.",

    "You know how to keep things fun without making them meaningless.",

    "You have a natural ability to make people feel comfortable.",

    "You have a good balance between ambition and adaptability.",

    "You have the kind of personality that becomes more valuable with time.",

    "You have a lot going for you, even on days when you don't feel like it.",

    "You make people feel like their presence matters.",

    "You have a way of turning small moments into good memories.",

    "You're stronger than you think and smarter than you sometimes admit.",

    "You're the kind of person who can make someone's day without planning to.",

    "You have a personality that stands out without needing to shout.",

    "You have a great combination of individuality and warmth.",

    "You're someone worth getting to know.",

    "You have more influence on people around you than you probably notice.",

    "You make things more interesting simply by being involved.",

    "You have a good instinct for making people laugh.",

    "You have the potential to become exceptionally good at whatever you commit to.",

    "You have a way of making people feel like they belong.",

    "You're more valuable than you give yourself credit for.",

    "You have a personality that's difficult to fake—and that's a compliment.",

    "You're the kind of person whose absence would actually be noticed.",

    "You have a good mix of confidence, humor, and personality.",

    "You're someone people can build good memories with.",

    "You have a surprisingly strong ability to make difficult situations feel manageable.",

    "You have a presence that makes conversations more enjoyable.",

    "You're probably doing better than you think.",

    "You have qualities people don't always notice immediately, but appreciate deeply over time.",

    "You have something uniquely yours—and that's worth protecting.",

    "You're more impressive when you stop trying to impress people.",

    "You have the kind of personality that can turn strangers into friends."

];


let lastIndex = -1;


function getRandomCompliment() {

    if (compliments.length <= 1) {

        return compliments[0];

    }


    let index;

    do {

        index =
            Math.floor(
                Math.random() *
                compliments.length
            );

    } while (
        index === lastIndex
    );


    lastIndex = index;

    return compliments[index];

}


export default {

    name: "compliment",

    aliases: [
        "compliments",
        "praise"
    ],

    category: "fun",

    description:
        "Get a random compliment",

    usage:
        ".compliment",

    async execute(ctx) {

        const compliment =
            getRandomCompliment();


        return ctx.reply(

`╭━━━〔 💖 COMPLIMENT 〕━━━╮

${compliment}

╰━━━━━━━━━━━━━━━━━━━━━━━━╯`

        );

    }

};