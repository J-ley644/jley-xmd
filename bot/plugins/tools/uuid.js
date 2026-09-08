import crypto from "crypto";

export default {

    name: "uuid",

    aliases: [
        "guid"
    ],

    category: "tools",

    description: "Generate a unique UUID",

    usage: ".uuid",

    permissions: {},

    async execute(ctx) {

        const uuid =
            crypto.randomUUID();

        return ctx.success(
`?? UUID Generator

${uuid}

?? ${ctx.botName}`
        );

    }

};
