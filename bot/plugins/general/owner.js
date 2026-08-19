import config from "../../config/config.js";

export default {

    name: "owner",

    aliases: [
        "creator"
    ],

    category: "general",

    description: "Show the JLEY-XMD owner contact",

    usage: ".owner",

    permissions: {},

    async execute(ctx) {

        const number =
            String(config.owner.number || "")
                .replace(/\D/g, "");

        const name =
            config.owner.name ||
            "JLEY";

        if (!number) {

            return ctx.error(
                "❌ Owner contact is not configured."
            );

        }

        return ctx.send({

            contacts: {

                displayName: name,

                contacts: [

                    {

                        vcard:

`BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${number}:${number}
END:VCARD`

                    }

                ]

            }

        });

    }

};