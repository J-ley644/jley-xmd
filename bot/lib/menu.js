import config from "../config/config.js";

function generateMenu(plugins) {

    console.log("MENU SIZE:", plugins.size);

for (const [key, command] of plugins) {
    console.log(
        "MENU ENTRY:",
        key,
        "=>",
        command.name
    );
}

    const categories = {};

    for (const [, command] of plugins) {

        const category = command.category || "other";

        if (!categories[category]) {
            categories[category] = [];
        }

        categories[category].push(command);

    }

    let menu =
`╭━━━〔 ${config.botName} 〕━━━╮

🤖 Version : ${config.version}
⚡ Status  : ${config.status}

━━━━━━━━━━━━━━━━━━

`;

    for (const category in categories) {

        menu += `📂 ${category.toUpperCase()} (${categories[category].length})\n\n`;

        for (const command of categories[category]) {

            menu += `• ${command.name}\n`;

        }

        menu += "\n";

    }

    menu +=
`━━━━━━━━━━━━━━━━━━

📖 Usage

.help <category>

Example

.help general

╰━━━━━━━━━━━━━━━━━━╯`;

    return menu;

}

export default generateMenu;