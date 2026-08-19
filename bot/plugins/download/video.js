import youtubeDl from "youtube-dl-exec";
import fs from "fs";
import os from "os";
import path from "path";

const FFMPEG_DIR = String.raw`C:\Users\KONZA-VDI\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build-shared\bin`;

function createTempDirectory() {
    return fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "jley-xmd-video-"
        )
    );
}

function sanitizeFileName(name) {
    return String(
        name || "JLEY-XMD Video"
    )
        .replace(/[\\/:*?"<>|]/g, "_")
        .slice(0, 100);
}

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
        // Ignore cleanup errors.
    }
}

function isYouTubeUrl(text) {
    return /^https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i.test(
        text.trim()
    );
}

async function searchYouTube(query) {

    const result =
        await youtubeDl(
            `ytsearch1:${query}`,
            {
                dumpSingleJson: true,
                noWarnings: true,
                noCheckCertificates: true,
                skipDownload: true,
                flatPlaylist: true,

                extractorArgs:
                    "youtube:player_client=mweb"
            }
        );

    const entry =
        result?.entries?.[0];

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
            "JLEY-XMD Video"
    };
}

export default {

    name: "video",

    aliases: [
        "vid"
    ],

    cooldown: 15,

    category: "download",

    description:
        "Download videos from YouTube",

    usage:
        ".video <video name or YouTube URL>",

    permissions: {},

    async execute(ctx) {

        const query =
            ctx.args
                .join(" ")
                .trim();

        if (!query) {

            return await ctx.reply(
                `🎬 *JLEY-XMD VIDEO*\n\n` +
                `Usage:\n` +
                `${ctx.prefix}video <video name>\n` +
                `${ctx.prefix}video <YouTube URL>\n\n` +
                `Example:\n` +
                `${ctx.prefix}video Alan Walker Faded`
            );

        }

        let directory = null;

        try {

            await ctx.reply(
                "🔎 Searching for your video..."
            );

            let url = query;

            let title =
                "JLEY-XMD Video";

            if (
                !isYouTubeUrl(query)
            ) {

                const result =
                    await searchYouTube(
                        query
                    );

                url =
                    result.url;

                title =
                    result.title;
            }

            directory =
                createTempDirectory();

            const outputTemplate =
                path.join(
                    directory,
                    "%(title)s.%(ext)s"
                );

            await ctx.reply(
                `⬇️ Downloading video:\n*${title}*`
            );

            await youtubeDl(
                url,
                {
                    output:
                        outputTemplate,

                    noPlaylist:
                        true,

                    noWarnings:
                        true,

                    noCheckCertificates:
                        true,

                    quiet:
                        true,

                    ffmpegLocation:
                        FFMPEG_DIR,

                    extractorArgs:
                        "youtube:player_client=mweb",

                    /*
                     * Prefer MP4 video with MP4 audio.
                     * If separate streams are required,
                     * yt-dlp + FFmpeg will merge them.
                     */
                    format:
                        "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/18",

                    mergeOutputFormat:
                        "mp4"
                }
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

            const videoPath =
                path.join(
                    directory,
                    videoFile
                );

            const video =
                await fs.promises.readFile(
                    videoPath
                );

            const stats =
                await fs.promises.stat(
                    videoPath
                );

            console.log(
                `JLEY-XMD VIDEO: ${(
                    stats.size /
                    1024 /
                    1024
                ).toFixed(2)} MB`
            );

            await ctx.send({

                video,

                mimetype:
                    "video/mp4",

                fileName:
                    `${sanitizeFileName(title)}.mp4`

            });

        } catch (error) {

            console.error(
                "VIDEO ERROR:",
                error
            );

            await ctx.reply(
                "❌ Sorry, I couldn't download that video. Please try another YouTube video."
            );

        } finally {

            await cleanup(
                directory
            );

        }

    }

};