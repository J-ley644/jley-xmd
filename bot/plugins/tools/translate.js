export default {

    name: "translate",

    aliases: [
        "tr",
        "trans"
    ],

    category: "tools",

    description: "Translate text between languages",

    usage: ".translate <from> <to> <text>",

    permissions: {},

    async execute(ctx) {

        if (ctx.args.length < 3) {

            return ctx.error(
`?? Translator

Usage:
${ctx.prefix}translate <from> <to> <text>

Examples:
${ctx.prefix}translate en sw Hello
${ctx.prefix}translate en fr Good morning
${ctx.prefix}translate sw en Habari yako?`
            );

        }

        const from =
            ctx.args[0].toLowerCase();

        const to =
            ctx.args[1].toLowerCase();

        const text =
            ctx.args.slice(2).join(" ").trim();

        if (!text) {

            return ctx.error(
                "? Please provide text to translate."
            );

        }

        if (
            !/^[a-z]{2,5}$/.test(from) ||
            !/^[a-z]{2,5}$/.test(to)
        ) {

            return ctx.error(
`? Invalid language code.

Examples:
en = English
sw = Swahili
fr = French
es = Spanish`
            );

        }

        try {

            const url =
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(from)}|${encodeURIComponent(to)}`;

            const response =
                await fetch(url);

            if (!response.ok) {
                throw new Error("Translation request failed");
            }

            const data =
                await response.json();

            const translation =
                data.responseData?.translatedText;

            if (!translation) {

                return ctx.error(
                    "? Translation could not be found."
                );

            }

            return ctx.success(
`?? Translation

?? Original • ${text}
?? ${from} ? ${to}

?? Translation:
${translation}

?? ${ctx.botName}`
            );

        } catch (error) {

            console.error(
                "Translate command error:",
                error
            );

            return ctx.error(
                "? Translation service is currently unavailable."
            );

        }

    }

};
