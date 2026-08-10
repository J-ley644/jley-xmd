import ytdl from "@distube/ytdl-core";
import YouTube from "youtube-search-api";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import os from "os";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath);

function sanitizeFileName(name) {
return name
.replace(/[\/:*?"<>|]/g, "_")
.replace(/\s+/g, " ")
.trim()
.slice(0, 100);
}

function createTempFile() {
return path.join(
os.tmpdir(),
`jley-xmd-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`
);
}

function convertToMp3(inputStream, outputFile) {
return new Promise((resolve, reject) => {
ffmpeg(inputStream)
.audioCodec("libmp3lame")
.audioBitrate("128k")
.format("mp3")
.on("end", resolve)
.on("error", reject)
.save(outputFile);
});
}

async function removeFile(file) {
try {
await fs.promises.unlink(file);
} catch {
// Ignore cleanup errors.
}
}

async function findVideo(query) {
const result = await YouTube.GetListByKeyword(
query,
false,
1
);


if (!result?.items?.length) {
    return null;
}

const video = result.items[0];

if (!video.id) {
    return null;
}

return {
    url: `https://www.youtube.com/watch?v=${video.id}`,
    title: video.title || "Requested song"
};


}

export default {
name: "play",


aliases: [
    "song"
],

cooldown: 10,

category: "download",

description: "Search and download audio from YouTube",

usage: ".play <song name or YouTube URL>",

permissions: {},

async execute(ctx) {

    const query = ctx.args.join(" ").trim();

    if (!query) {
        return await ctx.reply(
            `🎵 *JLEY-XMD PLAY*\n\n` +
            `Usage:\n` +
            `${ctx.prefix}play <song name>\n\n` +
            `Example:\n` +
            `${ctx.prefix}play Calm Down`
        );
    }

    let videoUrl = query;
    let title = "Requested song";

    let tempFile = null;

    try {

        await ctx.reply(
            "🔎 Searching for your song..."
        );

        /*
         * Search YouTube if the user entered
         * a song name instead of a URL.
         */
        if (!ytdl.validateURL(query)) {

            const video = await findVideo(query);

            if (!video) {
                return await ctx.reply(
                    "❌ I couldn't find that song on YouTube."
                );
            }

            videoUrl = video.url;
            title = video.title;

        } else {

            /*
             * Get title from the YouTube page.
             */
            try {

                const info = await ytdl.getInfo(
                    videoUrl
                );

                title =
                    info.videoDetails?.title ||
                    title;

            } catch {
                // Keep fallback title.
            }

        }

        /*
         * Make sure the URL is valid before
         * passing it to ytdl.
         */
        if (!ytdl.validateURL(videoUrl)) {
            return await ctx.reply(
                "❌ Invalid YouTube URL."
            );
        }

        await ctx.reply(
            `🎵 *${title}*\n\n` +
            `⏳ Downloading audio...`
        );

        tempFile = createTempFile();

        /*
         * Get the best available audio stream.
         */
        const audioStream = ytdl(
            videoUrl,
            {
                quality: "highestaudio",
                filter: "audioonly",
                highWaterMark: 1 << 25
            }
        );

        /*
         * Convert the stream to MP3.
         */
        await convertToMp3(
            audioStream,
            tempFile
        );

        const audio = await fs.promises.readFile(
            tempFile
        );

        /*
         * Send audio through the existing
         * JLEY-XMD context API.
         */
        await ctx.send({
            audio,
            mimetype: "audio/mpeg",
            fileName: `${sanitizeFileName(title)}.mp3`,
            ptt: false
        });

    } catch (error) {

        console.error(
            "JLEY-XMD PLAY ERROR:",
            error
        );

        await ctx.reply(
            "❌ I couldn't download that song right now. Please try another song."
        );

    } finally {

        if (tempFile) {
            await removeFile(tempFile);
        }

    }
}


};
