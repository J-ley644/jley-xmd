import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

function convertToMp3(buffer) {

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn(ffmpegPath, [
            "-i", "pipe:0",
            "-vn",
            "-codec:a", "libmp3lame",
            "-b:a", "128k",
            "-f", "mp3",
            "pipe:1"
        ]);

        const chunks = [];
        const errors = [];

        ffmpeg.stdout.on("data", chunk => {
            chunks.push(chunk);
        });

        ffmpeg.stderr.on("data", chunk => {
            errors.push(chunk);
        });

        ffmpeg.on("error", reject);

        ffmpeg.on("close", code => {

            if (code !== 0) {

                return reject(
                    new Error(
                        Buffer.concat(errors).toString()
                    )
                );

            }

            resolve(
                Buffer.concat(chunks)
            );

        });

        ffmpeg.stdin.on("error", reject);

        ffmpeg.stdin.end(buffer);

    });

}


export default {

    name: "mp3",

    aliases: ["tomp3", "audio"],

    category: "media",

    description: "Extract audio from a video or convert audio to MP3.",

    usage: ".mp3",

    cooldown: 10,

    permissions: {},

    async execute(ctx) {

        if (
            !ctx.isReply ||
            (!ctx.isVideo && !ctx.isAudio)
        ) {

            return ctx.error(
                "Reply to a video or audio message with .mp3"
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            const mp3 =
                await convertToMp3(buffer);

            await ctx.send({

                audio: mp3,

                mimetype: "audio/mpeg",

                ptt: false

            });

        } catch (error) {

            console.error(
                "[MP3]",
                error
            );

            return ctx.error(
                "Failed to convert the media to MP3."
            );

        }

    }

};