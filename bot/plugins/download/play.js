import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

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
| Temporary directory
|--------------------------------------------------------------------------
*/

async function createTempDirectory() {

    return fs.promises.mkdtemp(
        path.join(
            os.tmpdir(),
            "jley-xmd-audio-"
        )
    );

}


/*
|--------------------------------------------------------------------------
| Cleanup
|--------------------------------------------------------------------------
*/

async function cleanup(directory) {

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
| Run yt-dlp
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

                /*
                | yt-dlp JSON output can be large.
                | This does NOT buffer downloaded media.
                */

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
            "JLEY-XMD Audio"

    };

}


/*
|--------------------------------------------------------------------------
| Get YouTube information
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
            title: "JLEY-XMD Audio"
        };

    }

}


/*
|--------------------------------------------------------------------------
| Download audio
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Audio is downloaded directly to disk.
|
| We do NOT use fs.readFile().
|
|--------------------------------------------------------------------------
*/

async function downloadAudio(
    url,
    directory
) {

    const outputTemplate =
        path.join(
            directory,
            "audio.%(ext)s"
        );

    await runYtDlp([

        url,

        "--no-playlist",

        "--no-warnings",

        "--quiet",

        /*
        | Prefer audio-only formats.
        | This avoids downloading video unnecessarily.
        */

        "-f",

        "bestaudio[ext=m4a]/bestaudio/best",

        "--output",

        outputTemplate

    ]);

    const files =
        await fs.promises.readdir(
            directory
        );

    const audioFile =
        files.find(
            file =>
                /\.(m4a|mp3|webm|opus|aac|wav)$/i
                    .test(file)
        );

    if (!audioFile) {

        throw new Error(
            "yt-dlp completed but no audio file was created."
        );

    }

    return path.join(
        directory,
        audioFile
    );

}


/*
|--------------------------------------------------------------------------
| Plugin
|--------------------------------------------------------------------------
*/

export default {

    name: "play",

    aliases: [
        "song"
    ],

    cooldown: 10,

    category: "download",

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

        if (!query) {

            return ctx.reply(
                "🎵 *JLEY-XMD PLAY*\n\n" +
                "Usage:\n" +
                `${ctx.prefix}play <song name>\n` +
                `${ctx.prefix}song <song name>\n\n` +
                "You can also provide a YouTube URL."
            );

        }

        let directory = null;

        try {

            let url = query;

            let title =
                "JLEY-XMD Audio";


            /*
            |--------------------------------------------------------------------------
            | Search
            |--------------------------------------------------------------------------
            */

            if (!isYouTubeUrl(query)) {

                await ctx.reply(
                    "🔎 Searching YouTube..."
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

                await ctx.reply(
                    "🔎 Reading YouTube audio..."
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
            | Temporary directory
            |--------------------------------------------------------------------------
            */

            directory =
                await createTempDirectory();


            await ctx.reply(
                `⬇️ *Downloading audio:*\n${title}`
            );


            /*
            |--------------------------------------------------------------------------
            | Download directly to disk
            |--------------------------------------------------------------------------
            */

            const audioPath =
                await downloadAudio(
                    url,
                    directory
                );


            /*
            |--------------------------------------------------------------------------
            | Send from disk
            |--------------------------------------------------------------------------
            |
            | Passing a file path avoids creating another
            | giant Buffer with fs.readFile().
            |
            */

            await ctx.send({

                audio: {
                    url: audioPath
                },

                mimetype:
                    "audio/mpeg",

                fileName:
                    `${sanitizeFileName(title)}.mp3`,

                ptt: false

            });

        } catch (error) {

            console.error(
                "JLEY-XMD PLAY ERROR:",
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
                    "❌ I couldn't find that song on YouTube."
                );

            }

            return ctx.reply(
                "❌ Sorry, I couldn't download that audio. Please try another song or YouTube URL."
            );

        } finally {

            await cleanup(
                directory
            );

        }

    }

};