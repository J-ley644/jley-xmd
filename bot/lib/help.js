import config from "../config/config.js";

function capitalize(text) {

    return text.charAt(0).toUpperCase() +
           text.slice(1);

}

export function categoryHelp(category, plugins) {

    const commands = [];

    for (const [, plugin] of plugins) {

        if (
            (plugin.category || "other")
            .toLowerCase() === category.toLowerCase()
        ) {

            commands.push(plugin);

        }

    }

    if (!commands.length) {

        return `❌ Category "${category}" not found.`;

    }

    let text =
`╭━━━〔 ${capitalize(category)} Commands 〕━━━╮

`;

    commands
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(cmd => {

            text += `• ${cmd.name}\n`;

        });

    text +=
`\n━━━━━━━━━━━━━━

Total: ${commands.length}

╰━━━━━━━━━━━━━━╯`;

    return text;

}

export function commandHelp(command) {

    return
`Coming soon`;

}