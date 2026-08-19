import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/*
|--------------------------------------------------------------------------
| JLEY-XMD YouTube Downloader
|--------------------------------------------------------------------------
|
| We intentionally call the Python yt-dlp installation directly.
|
| This avoids depending on the user's global yt-dlp configuration and
| gives JLEY-XMD complete control over:
|
| - EJS challenge solving
| - mweb client
| - bgutil PO tokens
| - YouTube formats
|
|--------------------------------------------------------------------------
*/

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
| Temporary Directory
|--------------------------------------------------------------------------
*/

function createTempDirectory() {

    return fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "jley-xmd-youtube-"
        )
    );

}


/*
|--------------------------------------------------------------------------
| Filename Sanitizer
|--------------------------------------------------------------------------
*/

function sanitizeFileName(
    name,
    fallback = "JLEY-XMD Media"
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
        .slice(
            0,
            100
        ) || fallback;

}


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

async function cleanup(
    directory
) {

    if (!directory) {
        return;
    }

    try {

        await fs.promises.rm(
            directory,
            {
                recursive: true,
                force: true
            }
        );

    } catch {
        // Ignore cleanup failures.
    }

}


/*
|--------------------------------------------------------------------------
| YouTube URL Detection
|--------------------------------------------------------------------------
*/

function isYouTubeUrl(text) {
    return /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i.test(
        text.trim()
    );
}

/*
|--------------------------------------------------------------------------
| Run yt-dlp
|--------------------------------------------------------------------------
*/

async function runYtDlp(
    args
) {

    const finalArgs = [
        ...YTDLP_BASE_ARGS,
        ...args
    ];

    try {

        const result =
            await execFileAsync(
                PYTHON_BIN,
                [
                    "-m",
                    "yt_dlp",
                    ...finalArgs
                ],
                {
                    windowsHide: true,
                    maxBuffer:
                        20 * 1024 * 1024
                }
            );

        return result;

    } catch (error) {

        const stderr =
            String(
                error?.stderr ||
                ""
            ).trim();

        const stdout =
            String(
                error?.stdout ||
                ""
            ).trim();

        const details =
            stderr ||
            stdout ||
            error?.message ||
            "yt-dlp failed.";

        throw new Error(
            details
        );

    }

}


/*
|--------------------------------------------------------------------------
| Search YouTube
|--------------------------------------------------------------------------
*/

async function searchYouTube(
    query
) {

    const result =
        await runYtDlp(
            [
                `ytsearch1:${query}`,

                "--dump-single-json",

                "--skip-download",

                "--flat-playlist",

                "--no-warnings",

                "--quiet"
            ]
        );

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
            "JLEY-XMD Media",

        duration:
            entry.duration ||
            null

    };

}


/*
|--------------------------------------------------------------------------
| Get YouTube Information
|--------------------------------------------------------------------------
*/

async function getYouTubeInfo(
    url
) {

    const result =
        await runYtDlp(
            [
                url,

                "--dump-single-json",

                "--skip-download",

                "--no-warnings",

                "--quiet"
            ]
        );

    try {

        return JSON.parse(
            result.stdout
        );

    } catch {

        return {

            title:
                "JLEY-XMD Media"

        };

    }

}


/*
|--------------------------------------------------------------------------
| Download Progressive MP4
|--------------------------------------------------------------------------
|
| Format 18 is intentionally used initially.
|
| It contains:
|
| - H.264 video
| - AAC audio
|
| This means:
|
| NO separate video/audio merge is required.
|
|--------------------------------------------------------------------------
*/

async function downloadVideo(
    url,
    directory
) {

    const outputTemplate =
        path.join(
            directory,
            "video.%(ext)s"
        );

    await runYtDlp(
        [
            url,

            "-f",
            "18",

            "--no-playlist",

            "--no-warnings",

            "--quiet",

            "--output",
            outputTemplate
        ]
    );

    const files =
        await fs.promises.readdir(
            directory
        );

    const videoFile =
        files.find(
            file =>
                file
                    .toLowerCase()
                    .endsWith(".mp4")
        );

    if (!videoFile) {

        throw new Error(
            "yt-dlp completed but no MP4 video was created."
        );

    }

    return path.join(
        directory,
        videoFile
    );

}


/*
|--------------------------------------------------------------------------
| Extract MP3 From Downloaded MP4
|--------------------------------------------------------------------------
*/

async function extractAudio(
    videoPath,
    directory
) {

    const audioPath =
        path.join(
            directory,
            "audio.mp3"
        );

    await execFileAsync(
        "ffmpeg",
        [
            "-y",

            "-i",
            videoPath,

            "-vn",

            "-acodec",
            "libmp3lame",

            "-b:a",
            "128k",

            audioPath
        ],
        {
            windowsHide: true,
            maxBuffer:
                20 * 1024 * 1024
        }
    );

    return audioPath;

}


/*
|--------------------------------------------------------------------------
| Find Argument
|--------------------------------------------------------------------------
|
| This allows:
|
| .play ...
| .song ...
| .video ...
|
| to share the same downloader.
|
|--------------------------------------------------------------------------
*/

function getRequestedMode(
    ctx
) {

    const command =
        String(
            ctx.command ||
            ctx.commandName ||
            ""
        )
            .toLowerCase();

    if (
        command === "video"
    ) {

        return "video";

    }

    return "audio";

}


/*
|--------------------------------------------------------------------------
| Plugin
|--------------------------------------------------------------------------
*/

export default {

    name: "play",

    aliases: [
        "song",
        "video"
    ],

    cooldown: 10,

    category: "download",

    description:
        "Download YouTube songs or videos",

    usage:
        ".play <song name or YouTube URL>\n" +
        ".song <song name or YouTube URL>\n" +
        ".video <video name or YouTube URL>",

    permissions: {},

    async execute(
        ctx
    ) {

        const query =
            ctx.args
                .join(" ")
                .trim();

        if (!query) {

            return await ctx.reply(
                `🎵 *JLEY-XMD YOUTUBE DOWNLOADER*\n\n` +
                `Usage:\n\n` +
                `${ctx.prefix}play <song name>\n` +
                `${ctx.prefix}song <song name>\n` +
                `${ctx.prefix}video <video name>\n\n` +
                `You can also provide a YouTube URL.\n\n` +
                `Example:\n` +
                `${ctx.prefix}play Calm Down\n` +
                `${ctx.prefix}video Alan Walker Faded`
            );

        }

        let directory = null;

        try {

            const mode =
                getRequestedMode(
                    ctx
                );

            /*
            |--------------------------------------------------------------------------
            | Search / Resolve URL
            |--------------------------------------------------------------------------
            */

            let url =
                query;

            let title =
                "JLEY-XMD Media";

            if (
                !isYouTubeUrl(
                    query
                )
            ) {

                await ctx.reply(
                    mode === "video"
                        ? "🔎 Searching for your video..."
                        : "🔎 Searching for your song..."
                );

                const result =
                    await searchYouTube(
                        query
                    );

                url =
                    result.url;

                title =
                    result.title;

            } else {

                /*
                |--------------------------------------------------------------------------
                | Direct URL
                |--------------------------------------------------------------------------
                */

                await ctx.reply(
                    mode === "video"
                        ? "🔎 Reading YouTube video..."
                        : "🔎 Reading YouTube audio..."
                );

                const info =
                    await getYouTubeInfo(
                        query
                    );

                title =
                    info?.title ||
                    title;

            }


            /*
            |--------------------------------------------------------------------------
            | Create Temporary Directory
            |--------------------------------------------------------------------------
            */

            directory =
                createTempDirectory();


            /*
            |--------------------------------------------------------------------------
            | Download Video
            |--------------------------------------------------------------------------
            */

            await ctx.reply(
                mode === "video"
                    ? `⬇️ *Downloading video:*\n${title}`
                    : `⬇️ *Downloading audio:*\n${title}`
            );


            const videoPath =
                await downloadVideo(
                    url,
                    directory
                );


            /*
            |--------------------------------------------------------------------------
            | VIDEO MODE
            |--------------------------------------------------------------------------
            */

            if (
                mode === "video"
            ) {

                const video =
                    await fs.promises.readFile(
                        videoPath
                    );

                await ctx.send({

                    video,

                    mimetype:
                        "video/mp4",

                    fileName:
                        `${sanitizeFileName(
                            title,
                            "JLEY-XMD Video"
                        )}.mp4`

                });

                return;

            }


            /*
            |--------------------------------------------------------------------------
            | AUDIO MODE
            |--------------------------------------------------------------------------
            */

            await ctx.reply(
                "🎵 Converting audio..."
            );

            const audioPath =
                await extractAudio(
                    videoPath,
                    directory
                );

            const audio =
                await fs.promises.readFile(
                    audioPath
                );


            await ctx.send({

                audio,

                mimetype:
                    "audio/mpeg",

                fileName:
                    `${sanitizeFileName(
                        title,
                        "JLEY-XMD Audio"
                    )}.mp3`,

                ptt: false

            });


        } catch (error) {

            console.error(
                "JLEY-XMD YOUTUBE ERROR:",
                error
            );

            const message =
                String(
                    error?.message ||
                    ""
                );

            if (
                message.includes(
                    "403"
                )
            ) {

                await ctx.reply(
                    "❌ YouTube rejected the media request (403). Please try the link again in a moment."
                );

            } else if (
                message.includes(
                    "No YouTube result"
                )
            ) {

                await ctx.reply(
                    "❌ I couldn't find that on YouTube. Try another search."
                );

            } else {

                await ctx.reply(
                    modeErrorMessage(
                        getRequestedMode(
                            ctx
                        )
                    )
                );

            }

        } finally {

            await cleanup(
                directory
            );

        }

    }

};


/*
|--------------------------------------------------------------------------
| Friendly Error Message
|--------------------------------------------------------------------------
*/

function modeErrorMessage(
    mode
) {

    if (
        mode === "video"
    ) {

        return (
            "❌ Sorry, I couldn't download that video. " +
            "Please try another YouTube URL or search."
        );

    }

    return (
        "❌ Sorry, I couldn't download that audio. " +
        "Please try another song or YouTube URL."
    );

}