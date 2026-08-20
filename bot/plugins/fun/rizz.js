const lines = [

    "Are you Wi-Fi? Because I'm really feeling a connection.",

    "Are you a keyboard? Because you're just my type.",

    "Are you made of copper and tellurium? Because you're Cu-Te.",

    "You must be a magician, because whenever you're around, everyone else disappears.",

    "I wasn't planning on smiling today, but then you showed up.",

    "Do you have a map? Because I keep getting lost in your vibe.",

    "Are you a notification? Because I get excited whenever I see you.",

    "If being attractive was a crime, you'd be serving a life sentence.",

    "Are you a charger? Because you just brought my energy back.",

    "I think my phone is broken. Your number isn't in it yet.",

    "Are you Google? Because you have everything I've been searching for.",

    "I was going to use a pickup line, but honestly, your smile distracted me.",

    "Are you a camera? Because every time I see you, I smile.",

    "You must be tired because you've been running through my mind all day.",

    "If compliments were currency, I'd be broke trying to impress you.",

    "Are you a sunset? Because I could stare at you for way too long.",

    "You have the kind of smile that could make a bad day reconsider itself.",

    "Are you an algorithm? Because somehow you keep showing up exactly where I want you.",

    "I don't believe in love at first sight, but I'm willing to reconsider.",

    "If I had a coin for every time you crossed my mind, I'd probably be rich.",

    "Are you Bluetooth? Because I think we're pairing.",

    "You must be a good song because I can't get you out of my head.",

    "I don't need a compass. Somehow I always end up looking your way.",

    "Are you coffee? Because you just made my day better.",

    "I was going to play it cool, but then I remembered I'm terrible at that.",

    "You have dangerous levels of charm for someone who isn't paying rent in my head.",

    "If vibes were a language, we'd already be having a conversation.",

    "You're not my type. You're somehow better than my type.",

    "I think the universe accidentally made you exactly my type.",

    "Are you an update? Because suddenly everything feels improved.",

    "You must have a good Wi-Fi connection because I feel the signal from here.",

    "I don't usually believe in signs, but you seem like a pretty good one.",

    "If your personality were a playlist, I'd never press skip.",

    "You have the kind of energy people write songs about.",

    "I could make a clever pickup line, but I'd rather just say you're cute.",

    "Are you a notification? Because seeing your name instantly improves my mood.",

    "I don't know what your favorite song is, but I already know you'd improve my playlist.",

    "If charm were a sport, you'd be undefeated.",

    "You have me questioning whether coincidence is actually a thing.",

    "I was having a normal day until you became part of it.",

    "Are you a password? Because I can't stop trying to figure you out.",

    "You must be a plot twist because I wasn't expecting to like you this much.",

    "If confidence had a face, it might look suspiciously like yours.",

    "You're the reason my screen time report is about to become embarrassing.",

    "I don't need a dating app. Apparently I just needed this conversation.",

    "Are you a shortcut? Because you just took me straight to distracted.",

    "You make ordinary conversations feel like something I'd want to remember.",

    "I came here with zero expectations and somehow found my favorite distraction.",

    "If I were a developer, I'd call you my favorite feature.",

    "Are you a bug? Because I can't stop thinking about you and I don't want to fix it.",

    "You must be a notification from my future, because I have a feeling I'll be seeing more of you.",

    "If you were code, you'd definitely be the part I refuse to delete.",

    "Are you open source? Because I'd love to spend more time getting to know you.",

    "I think my brain just crashed. You look way too good.",

    "You must be a server, because you're handling all my requests.",

    "Are you a commit? Because I'd like to keep you in my history.",

    "If attraction were a programming language, I'd be fluent around you.",

    "You have better uptime than my motivation.",

    "Are you a notification badge? Because I keep checking for you.",

    "I think you just caused a 404 in my brain. Logic not found.",

    "You must be an exception because you completely broke my normal behavior.",

    "Are you a Git commit? Because I'd like to push this relationship forward.",

    "I don't need autocomplete. Somehow my mind keeps completing every thought with you.",

    "You must be a clean build because everything looks better when you're around.",

    "Are you a software update? Because I didn't expect you, but now I don't want to go back.",

    "My code isn't the only thing getting compiled. Apparently my feelings are too.",

    "Are you a database? Because I want to know everything about you.",

    "If you were an API, I'd never want your endpoint to go offline.",

    "Are you a bug report? Because I can't ignore you.",

    "You have better compatibility with me than most of my apps.",

    "I think we have dependency issues. I keep needing your attention.",

    "Are you an infinite loop? Because I could keep talking to you forever.",

    "You must be JavaScript because you somehow made my logic disappear.",

    "If you were a function, I'd call you every day.",

    "Are you a variable? Because you keep changing the value of my mood.",

    "I tried to debug my feelings, but the problem turned out to be you.",

    "Are you a notification from WhatsApp? Because I really hope you're not something I can mute.",

    "If flirting were an exam, I'd probably fail—but I'd still sit next to you.",

    "I don't have a smooth line, but I do have excellent taste apparently.",

    "Are you a mirror? Because I can't help smiling when I see you.",

    "You look like the reason someone would forget what they were saying.",

    "I was going to say something clever, but you completely deleted my train of thought.",

    "If awkward flirting were attractive, I'd be unstoppable.",

    "I'm not flirting. I'm just aggressively appreciating your existence.",

    "You must be a magician because my confidence disappeared the moment you arrived.",

    "I don't know what's stronger—your charm or my inability to act normal around you.",

    "I could pretend to be mysterious, but honestly, I just think you're cute.",

    "You have the kind of smile that deserves its own warning label.",

    "I'm not saying you're distracting, but I just forgot what I was doing.",

    "If you were a notification, I'd never swipe you away.",

    "You have successfully upgraded my standards without installing anything.",

    "I think my heart just accepted a friend request.",

    "Are you gravity? Because I'm having trouble staying away.",

    "You're dangerously easy to like.",

    "I don't need a pickup line. Apparently my face already says everything.",

    "If I had one wish, I'd probably waste it asking for another conversation with you.",

    "You're the kind of person who makes 'just one more message' turn into two hours.",

    "I think you're my favorite unexpected distraction.",

    "If chemistry were Wi-Fi, we'd have full signal.",

    "You don't need rizz. Your personality is doing the work already.",

    "Honestly, I'm just here hoping you notice me before I embarrass myself.",

    "My flirting strategy is simple: hope you're impressed before I say something stupid.",

    "I have no idea where this conversation is going, but I'm enjoying the direction.",

    "You're cute. That's the whole pickup line. I'm keeping it simple.",

    "I was going to ask if you believe in fate, but honestly, meeting you is making the argument for me."

];


let lastIndex = -1;


function getRandomLine() {

    if (lines.length <= 1) {

        return lines[0];

    }


    let index;

    do {

        index =
            Math.floor(
                Math.random() *
                lines.length
            );

    } while (
        index === lastIndex
    );


    lastIndex = index;

    return lines[index];

}


export default {

    name: "rizz",

    aliases: [
        "pickup",
        "pickupline"
    ],

    category: "fun",

    description:
        "Get a random pickup line",

    usage:
        ".rizz",

    async execute(ctx) {

        const line =
            getRandomLine();


        return ctx.reply(

`╭━━━〔 😏 RIZZ 〕━━━╮

${line}

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};