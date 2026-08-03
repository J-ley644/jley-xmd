import config from "../config/config.js";


function getCategoryEmoji(category) {

    const emojis = {

        general: "⚡",
        group: "👥",
        download: "📥",
        owner: "👑",
        admin: "🛡️",
        tools: "🛠️",
        fun: "🎮",
        other: "📌"

    };


    return emojis[
        category.toLowerCase()
    ] || emojis.other;

}



function generateMenu(plugins) {


    const categories = {};



    for (const [, command] of plugins) {


        const category =
            command.category || "other";


        if (!categories[category]) {

            categories[category] = [];

        }


        categories[category].push(command);

    }





    let totalCommands = 0;


    Object
    .values(categories)
    .forEach(list => {

        totalCommands += list.length;

    });





    let menu =
`╭━━━〔 🤖 ${config.botName} 〕━━━╮

📌 Version
➜ ${config.version}

🟢 Status
➜ ${config.status}

⚙️ Mode
➜ ${config.mode}

📚 Commands
➜ ${totalCommands}

╰━━━━━━━━━━━━━━━━━━╯


╭━━━〔 📖 COMMAND CENTER 〕━━━╮

`;





    Object
    .keys(categories)
    .sort()
    .forEach(category => {


        const emoji =
            getCategoryEmoji(category);



        menu +=
`${emoji} ${category.toUpperCase()}

`;



        categories[category]
        .sort((a,b)=>
            a.name.localeCompare(b.name)
        )
        .forEach(command => {


            menu +=
`  ⚡ ${config.prefix}${command.name}

`;

        });



        menu +=
`━━━━━━━━━━━━━━━━━━

`;

    });





    menu +=
`╰━━━━━━━━━━━━━━━━━━╯


🚀 Powered by ${config.botName}

👑 Owner
${config.owner.name}

💡 Use:
${config.prefix}help <command>

`;



    return menu;

}



export default generateMenu;