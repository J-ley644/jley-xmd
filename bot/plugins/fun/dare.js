const dares = [

    "Send the last photo in your gallery to the person you last chatted with.",

    "Change your WhatsApp profile picture for 10 minutes.",

    "Send a message using only emojis.",

    "Type your next message with your eyes closed.",

    "Send 'I have something important to tell you...' and wait 30 seconds before explaining.",

    "Record yourself saying the alphabet backwards.",

    "Send a voice note singing the chorus of your favorite song.",

    "Use your phone with your non-dominant hand for the next 5 minutes.",

    "Send the third emoji in your recent emojis.",

    "Change your WhatsApp status to something completely random for 10 minutes.",

    "Write a sentence without using the letter 'e'.",

    "Send a voice note pretending to be a news reporter.",

    "Reply to the next message you receive with only 'Interesting...'.",

    "Send someone a genuine compliment.",

    "Write your name using only emojis.",

    "Send a voice note doing your best robot impression.",

    "Type the next message with your eyes closed.",

    "Send '😂' to the last person who messaged you.",

    "Describe yourself using exactly three words.",

    "Send a voice note pretending you're accepting an award.",

    "Use only GIFs or stickers for your next three replies.",

    "Send someone a random motivational message.",

    "Write a dramatic two-line poem about your phone.",

    "Send a voice note pretending to be a sports commentator.",

    "Say the first random thought that comes into your head.",

    "Send the person you last chatted with a completely random question.",

    "Change your profile name temporarily to something funny.",

    "Write a sentence where every word starts with the same letter.",

    "Send a voice note laughing for five seconds without explaining why.",

    "Describe your day like you're narrating a movie trailer.",

    "Send a message containing exactly five emojis and no words.",

    "Pretend you're a customer complaining about an imaginary restaurant.",

    "Send someone a compliment without using the words 'good', 'nice', or 'beautiful'.",

    "Make up a ridiculous conspiracy theory and send it to a friend.",

    "Send a voice note pretending you're giving a weather forecast.",

    "Write a fake breaking-news headline about yourself.",

    "Send someone 'We need to talk about what happened yesterday.' Then immediately reveal that nothing happened.",

    "Describe your favorite food without saying its name.",

    "Send a voice note speaking in a dramatic movie-villain voice.",

    "Write a short story using exactly 10 words.",

    "Send a random animal emoji to someone and refuse to explain for one minute.",

    "Pretend you're a tour guide describing your own room.",

    "Send a voice note pretending to be a famous celebrity.",

    "Write a message where every sentence ends with an exclamation mark!",

    "Send someone a completely harmless but ridiculously dramatic compliment.",

    "Describe your personality using three fictional characters.",

    "Send a voice note pretending to be an automated customer-service system.",

    "Make up a ridiculous name for yourself and use it for the next 10 minutes.",

    "Send someone a message containing only punctuation marks.",

    "Explain what you ate today as if you're reviewing a five-star restaurant.",

    "Write a fake autobiography title about your life.",

    "Send a voice note pretending you're announcing the winner of a competition.",

    "Create a ridiculous superhero name for yourself.",

    "Send a message using only words that start with the letter 'S'.",

    "Describe your phone as if it were your best friend.",

    "Pretend you're an alien trying to explain humans.",

    "Send someone a random wholesome message.",

    "Write a dramatic breakup message to your Wi-Fi.",

    "Send a voice note pretending to be a radio presenter.",

    "Create a ridiculous slogan for yourself.",

    "Describe your morning like it was an action movie.",

    "Send a voice note saying the same sentence in three different emotions.",

    "Write a fake advertisement for your favorite snack.",

    "Send someone a message that contains exactly seven words.",

    "Pretend you're a detective and explain a completely imaginary mystery.",

    "Create a ridiculous nickname for the person you last chatted with.",

    "Send a voice note pretending you're teaching a class about something you just invented.",

    "Describe your favorite movie without saying its title.",

    "Write a dramatic headline about what you did today.",

    "Send someone a random question that makes absolutely no sense.",

    "Pretend your phone is alive and write a conversation between you and it.",

    "Send a voice note pretending you're lost in the jungle.",

    "Create a fake company and give it a ridiculous name.",

    "Write a one-sentence horror story.",

    "Describe your current mood using only food.",

    "Send a voice note pretending you're reporting live from the moon.",

    "Invent a new word and explain what it means.",

    "Write a fake motivational quote and pretend you invented it.",

    "Send someone a message that sounds extremely formal about something completely ordinary.",

    "Pretend you're a professional commentator describing yourself walking across the room.",

    "Write a ridiculous rule that everyone in the world should follow.",

    "Send a voice note pretending you're answering questions at a press conference.",

    "Create a fake superhero origin story for yourself.",

    "Describe your favorite person without using their name.",

    "Send a message as if you're a medieval king or queen.",

    "Invent a ridiculous invention and explain why humanity needs it.",

    "Write a dramatic speech about losing your phone charger.",

    "Send a voice note pretending you're narrating a wildlife documentary.",

    "Create a fake holiday and explain how people should celebrate it.",

    "Describe your room like you're selling it to a billionaire.",

    "Send someone a completely random compliment.",

    "Pretend you're a detective investigating who stole the last snack.",

    "Write a fake news report about something that happened today.",

    "Send a voice note pretending you're accepting an award for absolutely nothing."

];


let lastIndex = -1;


function getRandomDare() {

    if (dares.length <= 1) {

        return dares[0];

    }


    let index;

    do {

        index =
            Math.floor(
                Math.random() * dares.length
            );

    } while (
        index === lastIndex
    );


    lastIndex = index;

    return dares[index];

}


export default {

    name: "dare",

    aliases: [
        "daregame"
    ],

    category: "fun",

    description:
        "Get a random dare",

    usage:
        ".dare",

    async execute(ctx) {

        const dare =
            getRandomDare();


        return ctx.reply(

`╭━━━〔 😈 DARE 〕━━━╮

${dare}

╰━━━━━━━━━━━━━━━━━━╯`

        );

    }

};