import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

function convertToGif(buffer) {

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn(ffmpegPath, [
            "-i", "pipe:0",
            "-vf", "fps=12,scale=480:-1:flags=lanczos",
            "-f", "gif",
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

    name: "togif",

    aliases: ["gif"],

    category: "media",

    description: "Convert a video into a GIF.",

    usage: ".togif",

    cooldown: 10,

    permissions: {},

    async execute(ctx) {

        if (!ctx.isReply || !ctx.isVideo) {

            return ctx.error(
                "Reply to a video with .togif"
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            const gif =
                await convertToGif(buffer);

            await ctx.send({

                video: gif,

                gifPlayback: true,

                caption: "🎞️ GIF created."

            });

        } catch (error) {

            console.error(
                "[TOGIF]",
                error
            );

            return ctx.error(
                "Failed to convert the video to GIF."
            );

        }

    }

};