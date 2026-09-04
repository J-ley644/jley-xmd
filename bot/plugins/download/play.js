/*
|--------------------------------------------------------------------------
| JLEY-XMD PLAY
|--------------------------------------------------------------------------
|
| Music downloader
|
| Flow:
|   .play <song name>
|   .play <YouTube URL>
|   .song <song name>
|
| This plugin intentionally does NOT use yt-dlp directly against YouTube.
| Instead:
|
|   1. Search YouTube when a song name is supplied.
|   2. Resolve the YouTube URL through an external audio API.
|   3. Send the returned audio URL directly through ctx.send().
|
|--------------------------------------------------------------------------
*/

const SEARCH_API =
    "https://apiziaul.vercel.app/api/downloader/ytplaymp3";

const YTDL_API =
    "https://api.sidycoders.xyz/api/ytdl";

const YTDL_API_KEY =
    "memberdycoders";

const REQUEST_TIMEOUT =
    45_000;


/*
|--------------------------------------------------------------------------
| Filename
|--------------------------------------------------------------------------
*/

function sanitizeFileName(
    name,
    fallback = "JLEY-XMD Audio"
) {

    return String(
        name || fallback
    )
        .replace(
            /[\\/:*?"<>|]/g,
            "_"
        )
        .replace(
            /[\x00-\x1F]/g,
            ""
        )
        .trim()
        .slice(0, 100)
        || fallback;

}


/*
|--------------------------------------------------------------------------
| YouTube URL
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
| HTTP JSON helper
|--------------------------------------------------------------------------
*/

async function fetchJson(
    url,
    options = {}
) {

    const controller =
        new AbortController();

    const timeout =
        setTimeout(
            () => controller.abort(),
            REQUEST_TIMEOUT
        );

    try {

        const response =
            await fetch(
                url,
                {
                    ...options,
                    signal:
                        controller.signal
                }
            );

        const text =
            await response.text();

        let data = null;

        try {

            data =
                JSON.parse(text);

        } catch {

            throw new Error(
                `Downloader API returned invalid JSON (${response.status}).`
            );

        }

        if (!response.ok) {

            throw new Error(
                data?.message ||
                data?.error ||
                `Downloader API returned HTTP ${response.status}.`
            );

        }

        return data;

    } catch (error) {

        if (
            error?.name ===
            "AbortError"
        ) {

            throw new Error(
                "The audio service took too long to respond."
            );

        }

        throw error;

    } finally {

        clearTimeout(
            timeout
        );

    }

}


/*
|--------------------------------------------------------------------------
| Search YouTube
|--------------------------------------------------------------------------
|
| Uses the reference bot's search API.
|
| Expected response:
|
| {
|   status: true,
|   result: {
|      title: "...",
|      downloadUrl: "..."
|   }
| }
|
| The actual response can vary, so several common fields are checked.
|--------------------------------------------------------------------------
*/

async function searchSong(
    query
) {

    const url =
        `${SEARCH_API}?query=${encodeURIComponent(query)}`;

    const data =
        await fetchJson(
            url
        );

    if (
        data?.status === false
    ) {

        throw new Error(
            "No YouTube result was found."
        );

    }

    const result =
        data?.result ||
        data?.data ||
        data;

    const audioUrl =
        result?.downloadUrl ||
        result?.download_url ||
        result?.url ||
        data?.downloadUrl ||
        data?.download_url;

    if (!audioUrl) {

        throw new Error(
            "The search service did not return an audio URL."
        );

    }

    const title =
        result?.title ||
        result?.name ||
        data?.title ||
        "JLEY-XMD Audio";

    return {

        audioUrl,

        title

    };

}


/*
|--------------------------------------------------------------------------
| Resolve YouTube URL
|--------------------------------------------------------------------------
|
| Uses the reference bot's YouTube downloader API.
|
| Expected response:
|
| {
|   status: true,
|   cdn: "https://..."
| }
|
|--------------------------------------------------------------------------
*/

async function resolveYouTubeAudio(
    youtubeUrl
) {

    const params =
        new URLSearchParams({

            url:
                youtubeUrl,

            format:
                "mp3",

            apikey:
                YTDL_API_KEY

        });

    const endpoint =
        `${YTDL_API}?${params.toString()}`;

    const data =
        await fetchJson(
            endpoint
        );

    if (
        data?.status === false
    ) {

        throw new Error(
            data?.message ||
            "The YouTube audio service rejected the request."
        );

    }

    const audioUrl =
        data?.cdn ||
        data?.downloadUrl ||
        data?.download_url ||
        data?.result?.downloadUrl ||
        data?.result?.url;

    if (!audioUrl) {

        throw new Error(
            "The YouTube audio service did not return an audio URL."
        );

    }

    return {

        audioUrl,

        title:
            data?.title ||
            data?.result?.title ||
            "JLEY-XMD Audio"

    };

}


/*
|--------------------------------------------------------------------------
| Plugin
|--------------------------------------------------------------------------
*/

export default {

    name:
        "play",

    aliases: [
        "song"
    ],

    cooldown:
        10,

    category:
        "download",

    description:
        "Download YouTube songs as audio",

    usage:
        ".play <song name or YouTube URL>\n" +
        ".song <song name or YouTube URL>",

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
                "🎵 *JLEY-XMD PLAY*\n\n" +
                "Usage:\n" +
                `${ctx.prefix}play <song name>\n` +
                `${ctx.prefix}song <song name>\n\n` +
                "You can also provide a YouTube URL."
            );

        }

        try {

            let audioUrl =
                null;

            let title =
                "JLEY-XMD Audio";


            /*
            |--------------------------------------------------------------------------
            | YouTube URL
            |--------------------------------------------------------------------------
            */

            if (
                isYouTubeUrl(
                    query
                )
            ) {

                await ctx.reply(
                    "🔎 Reading YouTube audio..."
                );

                const result =
                    await resolveYouTubeAudio(
                        query
                    );

                audioUrl =
                    result.audioUrl;

                title =
                    result.title ||
                    title;

            }


            /*
            |--------------------------------------------------------------------------
            | Song search
            |--------------------------------------------------------------------------
            */

            else {

                await ctx.reply(
                    "🔎 Searching for the song..."
                );

                const result =
                    await searchSong(
                        query
                    );

                audioUrl =
                    result.audioUrl;

                title =
                    result.title ||
                    title;

            }


            /*
            |--------------------------------------------------------------------------
            | Validate resolver result
            |--------------------------------------------------------------------------
            */

            if (!audioUrl) {

                throw new Error(
                    "No audio URL was returned."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Send audio
            |--------------------------------------------------------------------------
            |
            | Important:
            |
            | ctx.send() already supports:
            |
            |   audio: { url: "https://..." }
            |
            | So we don't download the file to the JLEY-XMD server.
            |
            |--------------------------------------------------------------------------
            */

            await ctx.reply(
                `⬇️ *Sending audio:*\n${title}`
            );


            await ctx.send({

                audio: {
                    url:
                        audioUrl
                },

                mimetype:
                    "audio/mpeg",

                fileName:
                    `${sanitizeFileName(title)}.mp3`,

                ptt:
                    false

            });


        } catch (error) {

            console.error(
                "JLEY-XMD PLAY ERROR:",
                error
            );

            const message =
                String(
                    error?.message ||
                    ""
                );


            /*
            |--------------------------------------------------------------------------
            | Search failure
            |--------------------------------------------------------------------------
            */

            if (
                message.includes(
                    "No YouTube result"
                )
            ) {

                return ctx.reply(
                    "❌ I couldn't find that song on YouTube."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Timeout
            |--------------------------------------------------------------------------
            */

            if (
                message.includes(
                    "too long to respond"
                )
            ) {

                return ctx.reply(
                    "❌ The audio service took too long to respond. Please try again."
                );

            }


            /*
            |--------------------------------------------------------------------------
            | Generic failure
            |--------------------------------------------------------------------------
            */

            return ctx.reply(
                "❌ Sorry, I couldn't download that audio. Please try another song or YouTube URL."
            );

        }

    }

};