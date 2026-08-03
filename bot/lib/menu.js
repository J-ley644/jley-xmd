import config from "../config/config.js";
import menuStore from "../system/menuStore.js";

function getCategoryEmoji(category) {

    const emojis = {

        general: "⚡",
        group: "👥",
        download: "📥",
        owner: "👑",
        admin: "🛡️",
        tools: "🛠️",
        fun: "🎮",
        automation: "🤖",
        media: "🎬",
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

    Object.values(categories).forEach(list => {

        totalCommands += list.length;

    });



    const announcement =
        menuStore.getAnnouncement();



    let menu =
`👋 Welcome to ${config.botName}

╭━━━━━━━━━━━━━━━━━━━━╮
│ 🤖 ${config.botName}
╰━━━━━━━━━━━━━━━━━━━━╯

📦 Version : ${config.version}
🟢 Status  : ${config.status}
⚙️ Mode    : ${config.mode}
📚 Commands: ${totalCommands}
📂 Categories: ${Object.keys(categories).length}

`;



    if (announcement.announcementEnabled) {

        menu +=
`━━━━━━━━━━━━━━━━━━━━

📢 OFFICIAL ANNOUNCEMENT

${announcement.announcement}

━━━━━━━━━━━━━━━━━━━━

`;

    }



    menu +=
`📂 COMMAND CATEGORIES

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
                .sort((a, b) =>
                    a.name.localeCompare(b.name)
                )
                .forEach(command => {

                    menu +=
`   • ${config.prefix}${command.name}
`;

                });

            menu += "\n";

        });



    menu +=
`━━━━━━━━━━━━━━━━━━━━

💡 Tip:
${config.prefix}help <command>

👑 Owner
${config.owner.name}

🚀 Powered by ${config.botName}
`;



    return menu;

}

export default generateMenu;