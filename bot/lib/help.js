import config from "../config/config.js";


function capitalize(text) {

    if (!text) return "";

    return text.charAt(0).toUpperCase() +
           text.slice(1);

}



function getPermissionText(permissions = {}) {

    const access = [];


    if (permissions.owner)
        access.push("👑 Owner");


    if (permissions.admin)
        access.push("🛡️ Admin");


    if (permissions.botAdmin)
        access.push("🤖 Bot Admin");


    if (permissions.group)
        access.push("👥 Group");


    if (permissions.private)
        access.push("💬 Private");


    return access.length
        ? access.join(" • ")
        : "🌍 Everyone";

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

        return (
`╭━━━〔 ❌ NOT FOUND 〕━━━╮

Category:
${category}

No commands available.

╰━━━━━━━━━━━━━━━━━━╯`
        );

    }



    let text =
`╭━━━〔 ${getCategoryEmoji(category)} ${category.toUpperCase()} 〕━━━╮

`;



    commands
        .sort((a,b)=>
            a.name.localeCompare(b.name)
        )
        .forEach((cmd,index)=>{


            text +=
`${index + 1}. ⚡ ${config.prefix}${cmd.name}

   └─ ${cmd.description || "No description"}

`;

        });



    text +=
`━━━━━━━━━━━━━━━━━━

📦 Total Commands:
${commands.length}

🤖 ${config.botName}

╰━━━━━━━━━━━━━━━━━━╯`;


    return text;

}





export function commandHelp(command) {


    if (!command) {

        return (
`❌ Command information unavailable.`
        );

    }



    return (

`╭━━━〔 ⚡ COMMAND INFO 〕━━━╮

🏷️ Name
➜ ${config.prefix}${command.name}


📖 Description
➜ ${command.description || "No description"}


📂 Category
➜ ${(command.category || "other").toUpperCase()}


⌨️ Usage
➜ ${command.usage || `${config.prefix}${command.name}`}


🔗 Aliases
➜ ${
    command.aliases?.length
    ? command.aliases.join(", ")
    : "None"
}


🔐 Access
➜ ${getPermissionText(command.permissions)}


⏳ Cooldown
➜ ${command.cooldown || 0}s


╰━━━━━━━━━━━━━━━━━━╯

🤖 Powered by ${config.botName}`
    );

}





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


    return emojis[category.toLowerCase()] || "📌";

}