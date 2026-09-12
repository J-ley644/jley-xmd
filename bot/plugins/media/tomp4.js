import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

function convertToMp4(buffer) {

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn(ffmpegPath, [
            "-i", "pipe:0",
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-movflags", "frag_keyframe+empty_moov",
            "-f", "mp4",
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

    name: "tomp4",

    aliases: ["mp4"],

    category: "media",

    description: "Convert media into MP4 video.",

    usage: ".tomp4",

    cooldown: 10,

    permissions: {},

    async execute(ctx) {

        if (!ctx.isReply || !ctx.isVideo) {

            return ctx.error(
                "Reply to a video with .tomp4"
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            const mp4 =
                await convertToMp4(buffer);

            await ctx.send({

                video: mp4,

                mimetype: "video/mp4",

                caption: "🎬 MP4 created."

            });

        } catch (error) {

            console.error(
                "[TOMP4]",
                error
            );

            return ctx.error(
                "Failed to convert the video to MP4."
            );

        }

    }

};