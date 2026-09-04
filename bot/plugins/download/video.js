/*
|--------------------------------------------------------------------------
| JLEY-XMD VIDEO
|--------------------------------------------------------------------------
|
| .video <video name>
| .video <YouTube URL>
|
| IMPORTANT:
|
| This command NEVER downloads or uploads the video.
|
| It only searches for the YouTube video and sends the YouTube link.
|
|--------------------------------------------------------------------------
*/

import youtubeSearchApi from "youtube-search-api";


/*
|--------------------------------------------------------------------------
| YouTube URL detection
|--------------------------------------------------------------------------
*/

function isYouTubeUrl(text) {

    return /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i
        .test(
            String(text).trim()
        );

}


/*
|--------------------------------------------------------------------------
| Search YouTube
|--------------------------------------------------------------------------
*/

async function searchYouTube(query) {

    const data =
        await youtubeSearchApi.GetListByKeyword(
            query,
            false,
            1,
            [
                {
                    type: "video"
                }
            ]
        );

    const item =
        data?.items?.find(
            result =>
                result?.type === "video" &&
                result?.id
        );

    if (!item) {

        throw new Error(
            "No YouTube result was found."
        );

    }

    return {

        url:
            `https://www.youtube.com/watch?v=${item.id}`,

        title:
            item.title ||
            "YouTube Video"

    };

}


/*
|--------------------------------------------------------------------------
| Plugin
|--------------------------------------------------------------------------
*/

export default {

    name:
        "video",

    aliases: [
        "vid"
    ],

    cooldown:
        10,

    category:
        "download",

    description:
        "Find a YouTube video and send its link",

    usage:
        ".video <video name or YouTube URL>",

    permissions: {},

    async execute(ctx) {

        const query =
            Array.isArray(ctx.args)
                ? ctx.args.join(" ").trim()
                : "";

        /*
        |--------------------------------------------------------------------------
        | Empty query
        |--------------------------------------------------------------------------
        */

        if (!query) {

            return ctx.reply(

                "🎬 *JLEY-XMD VIDEO*\n\n" +

                "Usage:\n" +

                `${ctx.prefix}video <video name>\n` +

                `${ctx.prefix}video <YouTube URL>\n\n` +

                "The command finds the video and sends its YouTube link."

            );

        }

        try {

            let result;


            /*
            |--------------------------------------------------------------------------
            | Existing YouTube URL
            |--------------------------------------------------------------------------
            |
            | Don't search again.
            |
            */

            if (
                isYouTubeUrl(
                    query
                )
            ) {

                result = {

                    url:
                        query,

                    title:
                        "YouTube Video"

                };

            }


            /*
            |--------------------------------------------------------------------------
            | Search by name
            |--------------------------------------------------------------------------
            */

            else {

                await ctx.reply(
                    "🔎 Finding your video..."
                );

                result =
                    await searchYouTube(
                        query
                    );

            }


            /*
            |--------------------------------------------------------------------------
            | Send ONLY the YouTube link
            |--------------------------------------------------------------------------
            */

            return ctx.reply(

                "🎬 *" +
                result.title +
                "*\n\n" +

                "▶️ *Watch on YouTube:*\n" +

                result.url

            );

        } catch (error) {

            console.error(
                "JLEY-XMD VIDEO ERROR:",
                error
            );

            const message =
                String(
                    error?.message ||
                    ""
                );


            /*
            |--------------------------------------------------------------------------
            | No result
            |--------------------------------------------------------------------------
            */

            if (
                message.includes(
                    "No YouTube result"
                )
            ) {

                return ctx.reply(
                    "❌ I couldn't find that video on YouTube."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Generic search failure
            |--------------------------------------------------------------------------
            */

            return ctx.reply(

                "❌ Sorry, I couldn't find that video. " +
                "Please try another search or YouTube URL."

            );

        }

    }

};