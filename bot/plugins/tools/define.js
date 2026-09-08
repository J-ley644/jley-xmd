export default {

    name: "define",

    aliases: [
        "meaning",
        "dictionary",
        "def"
    ],

    category: "tools",

    description: "Get the definition of an English word",

    usage: ".define <word>",

    permissions: {},

    async execute(ctx) {

        const word =
            ctx.args.join(" ").trim();

        if (!word) {

            return ctx.error(
`?? Dictionary

Usage:
${ctx.prefix}define <word>

Example:
${ctx.prefix}define technology`
            );

        }

        try {

            const response =
                await fetch(
                    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
                );

            if (!response.ok) {

                return ctx.error(
`? Word not found

I couldn't find a definition for:
${word}`
                );

            }

            const data =
                await response.json();

            const entry = data[0];

            const meanings =
                entry.meanings || [];

            if (!meanings.length) {

                return ctx.error(
                    `? No definition found for "${word}".`
                );

            }

            let output =
`?? Dictionary

?? Word • ${entry.word}`;

            for (
                let i = 0;
                i < Math.min(meanings.length, 3);
                i++
            ) {

                const meaning =
                    meanings[i];

                const definitions =
                    meaning.definitions || [];

                output +=
`\n\n?? ${meaning.partOfSpeech || "Meaning"}`;

                for (
                    let j = 0;
                    j < Math.min(definitions.length, 2);
                    j++
                ) {

                    const definition =
                        definitions[j];

                    output +=
`\n• ${definition.definition}`;

                    if (definition.example) {

                        output +=
`\n  Example: ${definition.example}`;

                    }

                }

            }

            output +=
`\n\n?? ${ctx.botName}`;

            return ctx.success(output);

        } catch (error) {

            console.error(
                "Define command error:",
                error
            );

            return ctx.error(
                "? Dictionary service is currently unavailable."
            );

        }

    }

};
