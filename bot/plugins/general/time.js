export default {

    name: "time",

    aliases: ["clock"],

    category: "general",

    description: "Show current server time",

    usage: ".time",

    permissions: {},

    async execute(ctx) {

        const now =
            new Date()
            .toLocaleString();


        await ctx.reply(
`🕒 Current Time

${now}`
        );

    }

};