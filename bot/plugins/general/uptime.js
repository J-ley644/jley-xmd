export default {

    name: "uptime",

    aliases: [
        "up"
    ],

    category: "general",

    description: "Show how long the bot has been running",

    usage: ".uptime",

    permissions: {},

    async execute(ctx) {

        const uptime =
            process.uptime();

        const days =
            Math.floor(
                uptime / 86400
            );

        const hours =
            Math.floor(
                (uptime % 86400) / 3600
            );

        const minutes =
            Math.floor(
                (uptime % 3600) / 60
            );

        const seconds =
            Math.floor(
                uptime % 60
            );

        const parts = [];

        if (days) {
            parts.push(
                `${days}d`
            );
        }

        if (hours) {
            parts.push(
                `${hours}h`
            );
        }

        if (minutes) {
            parts.push(
                `${minutes}m`
            );
        }

        parts.push(
            `${seconds}s`
        );

        return ctx.reply(
`╭━━━━━━━━〔 ⏱️ UPTIME 〕━━━━━━━━╮
┃
┃  🤖 ${ctx.botName}
┃
┃  ⏱️ Runtime
┃  ${parts.join(" ")}
┃
┃  🟢 Status: Online
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        );

    }

};