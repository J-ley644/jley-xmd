import pluginStore from "../../system/pluginStore.js";

export default {

    name: "help",

    aliases: [],

    category: "general",

    description: "Show help menu",

    usage: ".help",

    permissions: {},

    async execute(ctx) {

    const plugins = pluginStore.getAll();

    const query =
        (ctx.args[0] || "").toLowerCase();

    // ---------------------------------
    // .help
    // ---------------------------------

    if (!query) {

        const categories = {};

        for (const [, command] of plugins) {

            const category =
                command.category || "general";

            if (!categories[category]) {
                categories[category] = 0;
            }

            categories[category]++;

        }

        let text =
`╭━━━〔 📚 HELP MENU 〕━━━╮

Available Categories

`;

        for (const category of Object.keys(categories).sort()) {

            text += `📂 ${category} (${categories[category]})\n`;

        }

        text +=
`
━━━━━━━━━━━━━━━━━━

Example

.help general

╰━━━━━━━━━━━━━━━━━━╯`;

        return ctx.reply(text);

    }

    // ---------------------------------
    // .help <category>
    // ---------------------------------

    const commands = [];

    for (const [, command] of plugins) {

        if (
            (command.category || "general")
            .toLowerCase() === query
        ) {

            if (
                !commands.find(
                    cmd => cmd.name === command.name
                )
            ) {
                commands.push(command);
            }

        }

    }

    if (commands.length) {

        let text =
`╭━━━〔 ${query.toUpperCase()} COMMANDS 〕━━━╮

`;

        for (const command of commands) {

            text += `• ${command.name}\n`;

        }

        text +=
`
━━━━━━━━━━━━━━━━━━

Example

.help ${commands[0].name}

╰━━━━━━━━━━━━━━━━━━╯`;

        return ctx.reply(text);

    }

    // ---------------------------------
// .help <command>
// ---------------------------------

const command = plugins.get(query);

if (command) {

    const aliases =
        command.aliases?.length
            ? command.aliases.join(", ")
            : "None";

    const permissions = [];

    if (command.permissions?.owner)
        permissions.push("Owner");

    if (command.permissions?.admin)
        permissions.push("Group Admin");

    if (command.permissions?.botAdmin)
        permissions.push("Bot Admin");

    if (command.permissions?.group)
        permissions.push("Group Only");

    if (command.permissions?.private)
        permissions.push("Private Chat");

    const permissionText =
        permissions.length
            ? permissions.join(", ")
            : "Everyone";

    return ctx.reply(
`╭━━━〔 📖 COMMAND HELP 〕━━━╮

📌 Command
${command.name}

📝 Description
${command.description || "No description"}

⌨️ Usage
${command.usage || "No usage"}

📂 Category
${command.category || "general"}

🏷️ Aliases
${aliases}

🔒 Permissions
${permissionText}

╰━━━━━━━━━━━━━━━━━━╯`
    );

}

    return ctx.reply(
        `❌ No help found for "${query}".`
    );

}

};