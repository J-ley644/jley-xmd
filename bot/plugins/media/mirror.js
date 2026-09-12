import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

function mirrorImage(buffer) {

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn(ffmpegPath, [
            "-i", "pipe:0",
            "-vf", "hflip",
            "-f", "image2",
            "-vcodec", "mjpeg",
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

            resolve(Buffer.concat(chunks));

        });

        ffmpeg.stdin.on("error", reject);

        ffmpeg.stdin.end(buffer);

    });

}

export default {

    name: "mirror",

    aliases: ["flip"],

    category: "media",

    description: "Mirror an image horizontally.",

    usage: ".mirror",

    cooldown: 10,

    permissions: {},

    async execute(ctx) {

        if (!ctx.isReply || !ctx.isImage) {

            return ctx.error(
                "Reply to an image with .mirror"
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            const image =
                await mirrorImage(buffer);

            await ctx.send({

                image,

                caption: "🪞 Image mirrored."

            });

        } catch (error) {

            console.error(
                "[MIRROR]",
                error
            );

            return ctx.error(
                "Failed to mirror the image."
            );

        }

    }

};