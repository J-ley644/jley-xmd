import config from "../../config/config.js";

export default {

    name: "channel",

    aliases: ["updates"],

    category: "general",

    description: "Show updates channel",

    usage: ".channel",

    permissions: {},

    async execute(ctx) {

        await ctx.reply(
`📢 ${config.botName} Updates

Official updates channel coming soon.

Stay connected 🚀`
        );

    }

};