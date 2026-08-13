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

function getGreeting() {

    const hour =
        new Date().getHours();

    if (hour >= 5 && hour < 12) {

        return "🌅 Good Morning";

    }

    if (hour >= 12 && hour < 17) {

        return "☀️ Good Afternoon";

    }

    if (hour >= 17 && hour < 21) {

        return "🌇 Good Evening";

    }

    return "🌙 Good Night";

}

function normalizeCategory(category) {

    if (!category) {
        return null;
    }

    return category
        .trim()
        .toLowerCase();

}

function generateMenu(
    plugins,
    ctx,
    requestedCategory = null
) {

    const categories = {};

    for (const [, command] of plugins) {

        const category =
            command.category || "other";

        if (!categories[category]) {

            categories[category] = [];

        }

        categories[category].push(command);

    }

    const categoryNames =
        Object.keys(categories)
            .sort((a, b) =>
                a.localeCompare(b)
            );

    let totalCommands = 0;

    Object.values(categories)
        .forEach(list => {

            totalCommands += list.length;

        });

    const announcement =
        menuStore.getAnnouncement();

    const userName =
        ctx?.pushName || "User";

    const greeting =
        getGreeting();

    const prefix =
        ctx?.prefix || config.prefix;

    const version =
        ctx?.version || "Unknown";

    const status =
        config.status || "Online";

    const mode =
        config.mode || "Public";

    const uptime =
        ctx?.runtime?.formatUptime?.() ||
        "Unknown";

    const deployUrl =
        "https://jley-xmd.netlify.app";

    /*
        * =====================================================
     * channel link.
     */
    const channelUrl =
        "https://whatsapp.com/channel/0029Vb8Qfzt3AzNUi9kshy0u";

    const selectedCategory =
        normalizeCategory(
            requestedCategory
        );

    /*
     * =====================================================
     * CATEGORY MENU
     * =====================================================
     */

    if (selectedCategory) {

        const actualCategory =
            categoryNames.find(
                category =>
                    category.toLowerCase() ===
                    selectedCategory
            );

        if (!actualCategory) {

            return (
`╭━━〔 ❌ CATEGORY NOT FOUND 〕━━╮
┃
┃  No category named:
┃
┃  ❝ ${requestedCategory} ❞
┃
┃  Available categories:
┃
${categoryNames
    .map(category =>
        `┃  ${getCategoryEmoji(category)} ${category.toUpperCase()}`
    )
    .join("\n")}
┃
┃  Use:
┃  ${prefix}menu <category>
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
            );

        }

        const commands =
            categories[actualCategory]
                .slice()
                .sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

        const emoji =
            getCategoryEmoji(
                actualCategory
            );

        let menu =
`${emoji}⃝━─────✦ JLEY-XMD ✦─────━${emoji}

╭━━〔 ${emoji} ${actualCategory.toUpperCase()} COMMANDS 〕━━╮
┃
┃  📚 Total Commands • ${commands.length}
┃
`;

        commands.forEach(
            (command, index) => {

                const number =
                    String(index + 1)
                        .padStart(2, "0");

                menu +=
`┃  ${number} • ${prefix}${command.name}
`;

            }
        );

        menu +=
`┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 💡 QUICK HELP 〕━━━━━━╮
┃
┃  ${prefix}help <command>
┃  ${prefix}menu
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

╭━━〔 🌐 JLEY-XMD 〕━━━━━━━━╮
┃
┃  🚀 Deploy your own bot
┃  ${deployUrl}
┃
┃  📢 View our channel
┃  ${channelUrl}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━╯

       ✦ ${config.botName} ✦
    ── Built for WhatsApp ──
       Powered by JLEY`;

        return menu;

    }

    /*
     * =====================================================
     * MAIN MENU
     * =====================================================
     */

    let menu =
`${greeting}, *${userName}* 👋

🌐⃝━─────✦ J L E Y ─────✦⃝🌐
       ╭─━━━━━━━━━━━━─╮
       │ ✦ ${config.botName} ✦ │
       │  WhatsApp OS  │
       ╰─━━━━━━━━━━━━─╯
             ✦ ✦ ✦

╭━━━━━━━━〔 🏠 MAIN MENU 〕━━━━━━━━╮
┃
┃  ✦ Welcome to *${config.botName}*
┃
┃  ╭─〔 ⚙️ SYSTEM INFO 〕────────╮
┃  │ 👤 User       • ${userName}
┃  │ ⚡ Prefix     • ${prefix}
┃  │ 📦 Version    • ${version}
┃  │ 🟢 Status     • ${status}
┃  │ ⚙️ Mode       • ${mode}
┃  │ ⏱️ Uptime     • ${uptime}
┃  │ 📚 Commands   • ${totalCommands}
┃  │ 📂 Categories • ${categoryNames.length}
┃  ╰────────────────────────────╯
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

`;

    /*
     * =====================================================
     * ANNOUNCEMENT
     * =====================================================
     */

    if (
        announcement.announcementEnabled
    ) {

        menu +=
`╭━━━━━━━━〔 📢 ANNOUNCEMENT 〕━━━━━━━━╮
┃
┃  ${announcement.announcement}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

`;

    }

    /*
     * =====================================================
     * COMMAND CENTER
     * =====================================================
     */

    menu +=
`╭━━━━━━〔 ✦ COMMAND CENTER ✦ 〕━━━━━━╮
┃
`;

    categoryNames.forEach(
        (category, index) => {

            const emoji =
                getCategoryEmoji(category);

            const number =
                String(index + 1)
                    .padStart(2, "0");

            menu +=
`┃  ${number} ${emoji} ${category.toUpperCase()}
`;

        }
    );

    menu +=
`┃
┃  ───────「 CATEGORY ACCESS 」───────
┃
┃  ${prefix}menu <category>
┃
┃  Example:
┃  ${prefix}menu group
┃  ${prefix}menu tools
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

`;

    /*
     * =====================================================
     * QUICK ACCESS
     * =====================================================
     */

    menu +=
`╭────────〔 💡 QUICK ACCESS 〕────────╮
┃
┃  ⚡ ${prefix}help <command>
┃  📋 ${prefix}menu
┃
╰─────────────────────────────────────╯

`;

    /*
     * =====================================================
     * LINKS
     * =====================================================
     */

    menu +=
`╭━━━━━━━━〔 🌐 JLEY-XMD 〕━━━━━━━━╮
┃
┃  🚀 Deploy your own bot
┃  ${deployUrl}
┃
┃  📢 View our channel
┃  ${channelUrl}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

       ✦ *${config.botName}* ✦
    ── Built for WhatsApp ──
       Powered by JLEY`;

    return menu;

}

export default generateMenu;