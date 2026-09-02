import config from "../config/config.js";
import menuStore from "../system/menuStore.js";
const CHANNEL_URL =
    "https://whatsapp.com/channel/0029Vb8fXJpEquiKJsG56i29";

const icons = {
    general: "⚡",
    group: "👥",
    download: "📥",
    owner: "👑",
    admin: "🛡️",
    tools: "🛠️",
    fun: "🎮",
    automation: "🤖",
    media: "🎬",
    antidelete: "🗑️",
    other: "📌"
};

function greeting() {

    const hour = new Date().getHours();

    if (hour < 12) return "𝐆𝐨𝐨𝐝 𝐌𝐨𝐫𝐧𝐢𝐧𝐠";
    if (hour < 17) return "𝐆𝐨𝐨𝐝 𝐀𝐟𝐭𝐞𝐫𝐧𝐨𝐨𝐧";
    if (hour < 21) return "𝐆𝐨𝐨𝐝 𝐄𝐯𝐞𝐧𝐢𝐧𝐠";

    return "𝐆𝐨𝐨𝐝 𝐍𝐢𝐠𝐡𝐭";
}

function generateMenu(
    plugins,
    ctx,
    requestedCategory = null
) {

    const categories = {};
    const seen = new Set();

    /*
     * pluginStore contains both commands and aliases.
     * Only add each real command once to the menu.
     */
    for (const [, command] of plugins) {

        if (!command?.name) {
            continue;
        }

        const commandName =
            String(command.name).trim().toLowerCase();

        if (seen.has(commandName)) {
            continue;
        }

        seen.add(commandName);

        const category =
            command.category || "other";

        if (!categories[category]) {
            categories[category] = [];
        }

        categories[category].push(command);
    }

    const names = Object.keys(categories)
        .sort();

    const prefix =
        ctx?.prefix || config.prefix;

    const user =
        ctx?.pushName || "User";

    const version =
        ctx?.version || "Unknown";

    const uptime =
        ctx?.runtime?.formatUptime?.() ||
        "Unknown";

    /*
     * Count real commands, not aliases.
     */
    const total = seen.size;

    const category =
        requestedCategory
            ?.trim()
            .toLowerCase();

    if (category) {

        const actual =
            names.find(
                name =>
                    name.toLowerCase() === category
            );

        if (!actual) {

            return `╭─〔 𝐉𝐋𝐄𝐘 • 𝐗𝐌𝐃 〕─╮

  ❌ 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐲 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝

  "${requestedCategory}"

  𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞:
${names.map(
    name =>
        `  ${icons[name] || "•"} ${name.toUpperCase()}`
).join("\n")}

  › ${prefix}menu <category>

╰─〔 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐉𝐋𝐄𝐘-𝐗𝐌𝐃 𝐄𝐍𝐆𝐈𝐍𝐄𝐒 〕─╯`;

        }

        const commands =
            categories[actual]
                .slice()
                .sort(
                    (a, b) =>
                        a.name.localeCompare(b.name)
                );

        return `╭─〔 𝐉𝐋𝐄𝐘 • 𝐗𝐌𝐃 〕─╮

  ${icons[actual] || "📌"} 𝐌𝐄𝐍𝐔
  𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐘 • ${actual.toUpperCase()}

  ─────────────────

${commands.map(
    (cmd, i) =>
        `  ${String(i + 1).padStart(2, "0")} › ${prefix}${cmd.name}`
).join("\n")}

  ─────────────────

  › ${prefix}help <command>
  › ${prefix}menu

╰─〔 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐉𝐋𝐄𝐘-𝐗𝐌𝐃 𝐄𝐍𝐆𝐈𝐍𝐄𝐒 〕─╯`;

    }

    const announcement =
        menuStore.getAnnouncement();

    let menu = `╭─〔 𝐉𝐋𝐄𝐘 • 𝐗𝐌𝐃 〕─╮

  ${greeting()}, ${user} 👋

  𝐒𝐘𝐒𝐓𝐄𝐌
  ─────────────────
  ◇ User       ${user}
  ◇ Version    ${version}
  ◇ Status     ${config.status || "Online"}
  ◇ Mode       ${config.mode || "Public"}
  ◇ Uptime     ${uptime}
  ◇ Commands   ${total}
  ◇ Categories ${names.length}

`;

    if (announcement.announcementEnabled) {

        menu += `  📢 𝐀𝐍𝐍𝐎𝐔𝐍𝐂𝐄𝐌𝐄𝐍𝐓
  ─────────────────
  ${announcement.announcement}

`;

    }

    menu += `  𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐂𝐄𝐍𝐓𝐄𝐑
  ─────────────────
${names.map(
    (name, i) =>
        `  ${String(i + 1).padStart(2, "0")} › ${icons[name] || "📌"} ${name.toUpperCase()}`
).join("\n")}

  ─────────────────

  › ${prefix}menu <category>
  › ${prefix}help <command>

    📢 𝐉𝐋𝐄𝐘-𝐗𝐌𝐃 𝐂𝐇𝐀𝐍𝐍𝐄𝐋
  ${CHANNEL_URL}

  𝐉𝐋𝐄𝐘-𝐗𝐌𝐃 𝐄𝐍𝐆𝐈𝐍𝐄𝐒
  Deploy: https://jley-xmd.netlify.app

╰─〔 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐉𝐋𝐄𝐘-𝐗𝐌𝐃 𝐄𝐍𝐆𝐈𝐍𝐄𝐒 〕─╯`;

    return menu;
}

export default generateMenu;