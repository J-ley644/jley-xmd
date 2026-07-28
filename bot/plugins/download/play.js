import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ytdlp from "yt-dlp-exec";

import {
    searchYouTube
} from "../../lib/media/youtube.js";


ffmpeg.setFfmpegPath(ffmpegPath);


export default {

    name: "play",

    aliases: [
        "song",
        "music",
        "audio"
    ],

    category: "download",

    description: "Download a song from YouTube.",


    async execute(ctx) {

        let input = null;
        let output = null;

        try {

            if (!ctx.args.length) {

                return ctx.reply(
                    "Example:\n.play Faded Alan Walker"
                );

            }


            const query =
                ctx.args.join(" ");


            await ctx.react("⏳");


            console.log(
                "[PLAY] Searching:",
                query
            );


            const video =
                await searchYouTube(query);


            console.log(
                "[PLAY] Found:",
                video.title
            );



            const tempDir =
                path.join(
                    process.cwd(),
                    "temp"
                );


            if (!fs.existsSync(tempDir)) {

                fs.mkdirSync(
                    tempDir,
                    {
                        recursive: true
                    }
                );

            }


            const fileId =
                `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`;


            const template =
                path.join(
                    tempDir,
                    `${fileId}.%(ext)s`
                );


            output =
                path.join(
                    tempDir,
                    `${fileId}.mp3`
                );


            console.log(
                "[PLAY] Downloading:",
                video.url
            );


            await ytdlp(
                video.url,
                {
                    format: "bestaudio",
                    output: template,
                    noWarnings: true
                }
            );


            /*
            ========================================
            FIND DOWNLOADED AUDIO
            ========================================
            */

            const downloadedFiles =
                fs.readdirSync(tempDir)
                    .filter(file =>
                        file.startsWith(fileId + ".")
                    );


            if (!downloadedFiles.length) {

                throw new Error(
                    "yt-dlp completed but no audio file was created."
                );

            }


            const downloadedFile =
                downloadedFiles[0];


            input =
                path.join(
                    tempDir,
                    downloadedFile
                );


            const inputStats =
                fs.statSync(input);


            if (inputStats.size < 10000) {

                throw new Error(
                    `Downloaded audio file is unexpectedly small (${inputStats.size} bytes).`
                );

            }


            console.log(
                "[PLAY] Downloaded:",
                input,
                inputStats.size,
                "bytes"
            );


            /*
            ========================================
            FFMPEG CONVERSION
            ========================================
            */

            console.log(
                "[PLAY] Converting to MP3..."
            );


            await new Promise(
                (resolve, reject) => {

                    ffmpeg(input)

                        .audioCodec(
                            "libmp3lame"
                        )

                        .audioBitrate(128)

                        .format("mp3")

                        .on(
                            "start",
                            command => {

                                console.log(
                                    "[PLAY] FFmpeg:",
                                    command
                                );

                            }
                        )

                        .on(
                            "end",
                            resolve
                        )

                        .on(
                            "error",
                            reject
                        )

                        .save(output);

                }
            );


            /*
            ========================================
            VERIFY MP3
            ========================================
            */

            if (
                !fs.existsSync(output)
            ) {

                throw new Error(
                    "FFmpeg completed but MP3 file was not created."
                );

            }


            const outputStats =
                fs.statSync(output);


            if (outputStats.size < 10000) {

                throw new Error(
                    `Generated MP3 is unexpectedly small (${outputStats.size} bytes).`
                );

            }


            console.log(
                "[PLAY] MP3 ready:",
                outputStats.size,
                "bytes"
            );


            /*
            ========================================
            SEND AUDIO
            ========================================
            */

            await ctx.send({

                audio:
                    fs.readFileSync(output),

                mimetype:
                    "audio/mpeg",

                fileName:
                    `${video.title}.mp3`

            });


            await ctx.react("✅");


            console.log(
                "[PLAY] Completed:",
                video.title
            );


        } catch (error) {


            console.error(
                "[PLAY ERROR]",
                error?.stderr ||
                error?.message ||
                error
            );


            try {

                await ctx.react("❌");

            } catch {}


            try {

                await ctx.reply(
                    "❌ Failed to download audio.\nPlease try another song or search again."
                );

            } catch {}


        } finally {


            /*
            ========================================
            CLEANUP TEMP FILES
            ========================================
            */

            for (
                const file of [input, output]
            ) {

                if (
                    file &&
                    fs.existsSync(file)
                ) {

                    try {

                        fs.unlinkSync(file);

                    } catch (cleanupError) {

                        console.log(
                            "[PLAY] Cleanup failed:",
                            cleanupError.message
                        );

                    }

                }

            }

        }

    }

};