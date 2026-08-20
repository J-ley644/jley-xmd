const jokes = [

    "Why did the developer go broke? Because he used up all his cache.",

    "Why do programmers prefer dark mode? Because light attracts bugs.",

    "I told my computer I needed a break. Now it won't stop sending me vacation ads.",

    "Why was the JavaScript developer sad? Because he didn't know how to `null` his feelings.",

    "Why did the phone wear glasses? Because it lost its contacts.",

    "I asked my dog what's two minus two. He said nothing.",

    "Why don't eggs tell jokes? They'd crack each other up.",

    "What do you call a fake noodle? An impasta.",

    "Why did the bicycle fall over? Because it was two-tired.",

    "What do you call cheese that isn't yours? Nacho cheese.",

    "Why did the tomato turn red? Because it saw the salad dressing.",

    "What do clouds wear under their clothes? Thunderwear.",

    "Why can't your nose be 12 inches long? Because then it would be a foot.",

    "What do you call a sleeping bull? A bulldozer.",

    "Why did the math book look sad? Because it had too many problems.",

    "What did one wall say to the other wall? I'll meet you at the corner.",

    "Why don't skeletons fight each other? They don't have the guts.",

    "What do you call a bear with no teeth? A gummy bear.",

    "Why did the computer catch a cold? It left a window open.",

    "What did the ocean say to the beach? Nothing. It just waved.",

    "Why did the programmer quit his job? He didn't get arrays.",

    "Why are spiders such good web developers? They know how to build a great website.",

    "I would tell you a UDP joke, but you might not get it.",

    "There are 10 kinds of people in the world: those who understand binary and those who don't.",

    "Why was the computer cold? It left its Windows open.",

    "My Wi-Fi and I have a complicated relationship. We keep disconnecting.",

    "I tried to make a belt out of watches. It was a waist of time.",

    "I only know 25 letters of the alphabet. I don't know why.",

    "Why did the scarecrow win an award? Because he was outstanding in his field.",

    "What do you call a fish wearing a bowtie? Sofishticated.",

    "Why did the coffee file a police report? It got mugged.",

    "I used to hate facial hair, but then it grew on me.",

    "What do you call a factory that makes okay products? A satisfactory.",

    "Why did the golfer bring two pairs of pants? In case he got a hole in one.",

    "What happens when you tell a joke about construction? I'm still working on it.",

    "Why don't programmers like nature? It has too many bugs.",

    "My keyboard is broken. I don't know what to type.",

    "Why did the computer go to the doctor? It had a virus.",

    "I told my computer a joke. It didn't laugh. It just processed it.",

    "Why did the programmer bring a ladder? Because he wanted to reach the next level.",

    "I asked my computer for a joke. It said, '404: Humor not found.'",

    "Why did the developer cross the road? To debug the other side.",

    "I don't trust stairs. They're always up to something.",

    "Why don't scientists trust atoms? Because they make up everything.",

    "What do you call an alligator in a vest? An investigator.",

    "Why was six afraid of seven? Because seven ate nine.",

    "What did the zero say to the eight? Nice belt.",

    "Why did the banana go to the doctor? It wasn't peeling well.",

    "What kind of music do balloons hate? Pop.",

    "Why did the cookie go to the hospital? Because it felt crummy."

];


/*
|--------------------------------------------------------------------------
| Random Joke Selection
|--------------------------------------------------------------------------
|
| Avoid immediately repeating the same joke.
|
*/

let lastIndex = -1;


function getRandomJoke() {

    if (jokes.length <= 1) {

        return jokes[0];

    }


    let index;

    do {

        index =
            Math.floor(
                Math.random() * jokes.length
            );

    } while (
        index === lastIndex
    );


    lastIndex = index;

    return jokes[index];

}


export default {

    name: "joke",

    aliases: [
        "jokes",
        "funny"
    ],

    category: "fun",

    description:
        "Get a random joke",

    usage:
        ".joke",

    async execute(ctx) {

        const joke =
            getRandomJoke();


        return ctx.reply(

`╭━━━〔 😂 JOKE 〕━━━╮

${joke}

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};