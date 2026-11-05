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
import yts from "yt-search";


const YTDL_API =
    "https://api.sidycoders.xyz/api/ytdl";

const YTDL_API_KEY =
    "memberdycoders";

const REQUEST_TIMEOUT = 120_000;




    function playDebug(stage, details = {}) {
    const timestamp = new Date().toISOString();

    console.log(
        `[JLEY-PLAY DEBUG] ${timestamp} | ${stage}`,
        JSON.stringify(details)
    );
}



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

            playDebug("API RESPONSE", {
    host: new URL(url).hostname,
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get("content-type"),
    contentLength: response.headers.get("content-length")
});

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

async function searchSong(query) {
    playDebug("YOUTUBE SEARCH START", { query });

    const results = await yts(query);

    const video = results.videos?.[0];

    if (!video?.url) {
        throw new Error("No YouTube result was found.");
    }

    playDebug("YOUTUBE SEARCH RESULT", {
        title: video.title,
        videoUrl: video.url
    });

    return {
        youtubeUrl: video.url,
        title: video.title
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

async function downloadYouTubeAudio(youtubeUrl) {
    playDebug("SAMPLECUT DOWNLOAD START", {
        youtubeUrl
    });

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT
    );

    try {
        const response = await fetch(
            "https://api.samplecut.app/v1/downloads",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Client-Name": "JLEY-XMD"
                },
                body: JSON.stringify({
                    url: youtubeUrl,
                    format: "mp3",
                    response: "file"
                }),
                signal: controller.signal
            }
        );

        const contentType =
            response.headers.get("content-type") || "";

        if (!response.ok) {
            const errorBody = await response.text();

            let errorMessage = errorBody;

            try {
                const parsed = JSON.parse(errorBody);
                errorMessage =
                    parsed?.error?.message || errorBody;
            } catch {}

            throw new Error(
                `Samplecut HTTP ${response.status}: ${errorMessage}`
            );
        }

        if (!contentType.includes("audio/")) {
            throw new Error(
                `Samplecut returned unexpected content: ${contentType}`
            );
        }

        const audioBuffer = Buffer.from(
            await response.arrayBuffer()
        );

        if (!audioBuffer.length) {
            throw new Error("Samplecut returned an empty audio file.");
        }

        playDebug("SAMPLECUT DOWNLOAD COMPLETED", {
            contentType,
            size: audioBuffer.length
        });

        return {
            audioBuffer,
            contentType: contentType.split(";")[0]
        };

    } catch (error) {
        if (error.name === "AbortError") {
            throw new Error(
                "Audio extraction timed out. Please try again."
            );
        }

        throw error;

    } finally {
        clearTimeout(timeout);
    }
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

            let youtubeUrl = null;
let title = "JLEY-XMD Audio";

if (isYouTubeUrl(query)) {

    await ctx.reply("🔎 Reading YouTube audio...");
    youtubeUrl = query;

} else {

    await ctx.reply("🔎 Searching for the song...");

    const result = await searchSong(query);

    youtubeUrl = result.youtubeUrl;
    title = result.title || title;
}

if (!youtubeUrl) {
    throw new Error("No YouTube video URL was found.");
}

await ctx.reply(`⬇️ *Downloading audio:*\n${title}`);

const result = await downloadYouTubeAudio(youtubeUrl);

await ctx.send({
    audio: result.audioBuffer,
    mimetype: result.contentType,
    fileName: `${sanitizeFileName(title)}.mp3`,
    ptt: false
});

playDebug("WHATSAPP SEND COMPLETED", { title });



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