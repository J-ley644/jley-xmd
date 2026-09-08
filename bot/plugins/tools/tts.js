/*
|--------------------------------------------------------------------------
| JLEY-XMD TTS
|--------------------------------------------------------------------------
|
| Text-to-speech
|
| Usage:
|   .tts <text>
|   .tts <language> <text>
|
|--------------------------------------------------------------------------
*/

const TTS_API =
    "https://api.streamelements.com/kappa/v2/speech";

const REQUEST_TIMEOUT =
    30_000;

export default {

    name: "tts",

    aliases: [
        "say",
        "speak"
    ],

    category: "tools",

    description: "Convert text to speech",

    usage:
        ".tts <text>\n" +
        ".tts <language> <text>",

    permissions: {
    botOwner: true
},

    async execute(ctx) {

        const args =
            Array.isArray(ctx.args)
                ? ctx.args
                : [];

        if (!args.length) {

            return ctx.error(
`?? Text To Speech

Usage:
${ctx.prefix}tts <text>
${ctx.prefix}tts <language> <text>

Examples:
${ctx.prefix}tts Hello everyone
${ctx.prefix}tts en Hello everyone
${ctx.prefix}tts sw Habari kila mtu`
            );

        }

        let language =
            "en";

        let text =
            args.join(" ").trim();

        /*
        |--------------------------------------------------------------------------
        | Optional language
        |--------------------------------------------------------------------------
        */

        if (
            args.length >= 2 &&
            /^[a-z]{2,5}$/i.test(args[0])
        ) {

            language =
                args[0].toLowerCase();

            text =
                args.slice(1)
                    .join(" ")
                    .trim();

        }

        if (!text) {

            return ctx.error(
                "? Please provide text to convert to speech."
            );

        }

        if (text.length > 500) {

            return ctx.error(
                "? TTS text is limited to 500 characters."
            );

        }

        try {

            await ctx.reply(
                "?? Generating speech..."
            );

            const controller =
                new AbortController();

            const timeout =
                setTimeout(
                    () => controller.abort(),
                    REQUEST_TIMEOUT
                );

            try {

                const endpoint =
                    `${TTS_API}?voice=Brian&text=${encodeURIComponent(text)}`;

                const response =
                    await fetch(
                        endpoint,
                        {
                            signal:
                                controller.signal
                        }
                    );

                if (!response.ok) {

                    throw new Error(
                        `TTS service returned HTTP ${response.status}.`
                    );

                }

                /*
                |--------------------------------------------------------------------------
                | Send generated speech directly
                |--------------------------------------------------------------------------
                */

                await ctx.send({

                    audio: {
                        url: endpoint
                    },

                    mimetype:
                        "audio/mpeg",

                    fileName:
                        "JLEY-XMD-TTS.mp3",

                    ptt:
                        false

                });

            } finally {

                clearTimeout(
                    timeout
                );

            }

        } catch (error) {

            console.error(
                "JLEY-XMD TTS ERROR:",
                error
            );

            if (
                error?.name ===
                "AbortError"
            ) {

                return ctx.error(
                    "? TTS service took too long to respond."
                );

            }

            return ctx.error(
                "? Unable to generate speech right now."
            );

        }

    }

};
