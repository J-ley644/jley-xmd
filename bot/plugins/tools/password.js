import crypto from "crypto";

export default {

    name: "password",

    aliases: [
        "pass",
        "genpass"
    ],

    category: "tools",

    description: "Generate a secure random password",

    usage: ".password [length]",

    permissions: {},

    async execute(ctx) {

        let length = 16;

        if (ctx.args[0]) {
            length = parseInt(ctx.args[0], 10);
        }

        if (
            Number.isNaN(length) ||
            length < 8 ||
            length > 128
        ) {

            return ctx.error(
`?? Password Generator

Password length must be between 8 and 128 characters.

Example:
${ctx.prefix}password 20`
            );

        }

        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "0123456789" +
            "!@#$%^&*()-_=+[]{}";

        let password = "";

        const randomBytes =
            crypto.randomBytes(length);

        for (let i = 0; i < length; i++) {

            password +=
                characters[
                    randomBytes[i] % characters.length
                ];

        }

        return ctx.success(
`?? Secure Password

?? ${password}

?? Length • ${length}

?? Store it somewhere safe.

?? ${ctx.botName}`
        );

    }

};
