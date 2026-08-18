import youtubeDl from "youtube-dl-exec";
import fs from "fs";
import os from "os";
import path from "path";

const FFMPEG_DIR = String.raw`C:\Users\KONZA-VDI\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg.Shared_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0-full_build-shared\bin`;

function createTempDirectory() {
    return fs.mkdtempSync(
        path.join(
            os.tmpdir(),
            "jley-xmd-play-"
        )
    );
}

function sanitizeFileName(name) {
    return String(
        name || "JLEY-XMD Audio"
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
    return /^https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\//i.test(
        text
    );
}

async function searchYouTube(query) {
    const result = await youtubeDl(
        `ytsearch1:${query}`,
        {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            skipDownload: true,
            flatPlaylist: true
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
            "JLEY-XMD Audio"
    };
}

export default {

    name: "play",

    aliases: [
        "song"
    ],

    cooldown: 10,

    category: "download",

    description:
        "Search and download audio from YouTube",

    usage:
        ".play <song name or YouTube URL>",

    permissions: {},

    async execute(ctx) {

        const query =
            ctx.args.join(" ").trim();

        if (!query) {

            return await ctx.reply(
                `🎵 *JLEY-XMD PLAY*\n\n` +
                `Usage:\n` +
                `${ctx.prefix}play <song name>\n\n` +
                `Example:\n` +
                `${ctx.prefix}play Calm Down`
            );

        }

        let directory = null;

        try {

            await ctx.reply(
                "🔎 Searching for your song..."
            );

            let url = query;

            let title =
                "JLEY-XMD Audio";

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
                `⬇️ Downloading:\n*${title}*`
            );

            await youtubeDl(
                url,
                {
                    extractAudio: true,

                    audioFormat: "mp3",

                    audioQuality: "128K",

                    output:
                        outputTemplate,

                    noPlaylist: true,

                    noWarnings: true,

                    noCheckCertificates: true,

                    quiet: true,

                    ffmpegLocation:
                        FFMPEG_DIR
                }
            );

            const files =
                await fs.promises.readdir(
                    directory
                );

            const audioFile =
                files.find(
                    file =>
                        file
                            .toLowerCase()
                            .endsWith(".mp3")
                );

            if (!audioFile) {

                throw new Error(
                    "yt-dlp completed but no MP3 file was created."
                );

            }

            const audioPath =
                path.join(
                    directory,
                    audioFile
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
                    `${sanitizeFileName(title)}.mp3`,

                ptt: false

            });

        } catch (error) {

            console.error(
                "PLAY ERROR:",
                error
            );

            await ctx.reply(
                "❌ Sorry, I couldn't download that audio. Please try another song or YouTube URL."
            );

        } finally {

            await cleanup(
                directory
            );

        }

    }

};