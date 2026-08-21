import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync =
    promisify(execFile);

const PYTHON_BIN = "python";

const BGUTIL_URL =
    "https://jley-xmd-bgutil.onrender.com";

const YTDLP_BASE_ARGS = [
    "--ignore-config",
    "--remote-components",
    "ejs:github",
    "--extractor-args",
    "youtube:player_client=mweb",
    "--extractor-args",
    `youtubepot-bgutilhttp:base_url=${BGUTIL_URL}`
];

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
| Run yt-dlp metadata only
|--------------------------------------------------------------------------
*/

async function runYtDlp(args) {

    try {

        return await execFileAsync(
            PYTHON_BIN,
            [
                "-m",
                "yt_dlp",
                ...YTDLP_BASE_ARGS,
                ...args
            ],
            {
                windowsHide: true,
                maxBuffer:
                    8 * 1024 * 1024
            }
        );

    } catch (error) {

        const stderr =
            String(
                error?.stderr || ""
            ).trim();

        const stdout =
            String(
                error?.stdout || ""
            ).trim();

        throw new Error(
            stderr ||
            stdout ||
            error?.message ||
            "yt-dlp failed."
        );
    }
}

/*
|--------------------------------------------------------------------------
| Search YouTube
|--------------------------------------------------------------------------
*/

async function searchYouTube(query) {

    const result =
        await runYtDlp([
            `ytsearch1:${query}`,
            "--dump-single-json",
            "--skip-download",
            "--flat-playlist",
            "--no-warnings",
            "--quiet"
        ]);

    let data;

    try {

        data =
            JSON.parse(
                result.stdout
            );

    } catch {

        throw new Error(
            "Could not read the YouTube search result."
        );
    }

    const entry =
        data?.entries?.[0];

    if (
        !entry?.webpage_url &&
        !entry?.url
    ) {

        throw new Error(
            "No YouTube result was found."
        );
    }

    return {
        url:
            entry.webpage_url ||
            entry.url,

        title:
            entry.title ||
            "YouTube Video"
    };
}

/*
|--------------------------------------------------------------------------
| Resolve direct URL
|--------------------------------------------------------------------------
*/

async function getYouTubeInfo(url) {

    const result =
        await runYtDlp([
            url,
            "--dump-single-json",
            "--skip-download",
            "--no-warnings",
            "--quiet"
        ]);

    try {

        return JSON.parse(
            result.stdout
        );

    } catch {

        return {
            title: "YouTube Video",
            webpage_url: url
        };
    }
}

/*
|--------------------------------------------------------------------------
| Plugin
|--------------------------------------------------------------------------
*/

export default {

    name: "video",

    aliases: [
        "vid"
    ],

    cooldown: 10,

    category: "download",

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

        if (!query) {

            return ctx.reply(
                "🎬 *JLEY-XMD VIDEO*\n\n" +

                "Usage:\n" +

                `${ctx.prefix}video <video name>\n` +
                `${ctx.prefix}video <YouTube URL>\n\n` +

                "The command sends the YouTube link instead of uploading the video."
            );
        }

        try {

            await ctx.reply(
                "🔎 Finding your video..."
            );

            let result;

            if (
                isYouTubeUrl(query)
            ) {

                const info =
                    await getYouTubeInfo(
                        query
                    );

                result = {
                    url:
                        info?.webpage_url ||
                        query,

                    title:
                        info?.title ||
                        "YouTube Video"
                };

            } else {

                result =
                    await searchYouTube(
                        query
                    );
            }

            return ctx.reply(
                "🎬 *" +
                result.title +
                "*\n\n" +

                "▶️ Watch on YouTube:\n" +
                result.url
            );

        } catch (error) {

            console.error(
                "JLEY-XMD VIDEO ERROR:",
                error
            );

            const message =
                String(
                    error?.message || ""
                );

            if (
                message.includes(
                    "No YouTube result"
                )
            ) {

                return ctx.reply(
                    "❌ I couldn't find that video on YouTube."
                );
            }

            return ctx.reply(
                "❌ Sorry, I couldn't find that video. Please try another search or YouTube URL."
            );
        }
    }
};