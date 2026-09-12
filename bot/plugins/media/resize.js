import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

function resizeImage(buffer, width, height) {

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn(ffmpegPath, [
            "-i", "pipe:0",
            "-vf", `scale=${width}:${height}`,
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

    name: "resize",

    aliases: ["res"],

    category: "media",

    description: "Resize an image.",

    usage: ".resize 500 500",

    cooldown: 10,

    permissions: {},

    async execute(ctx) {

        if (!ctx.isReply || !ctx.isImage) {

            return ctx.error(
                "Reply to an image with .resize width height"
            );

        }

        const args = ctx.args || [];

        const width = parseInt(args[0]);
        const height = parseInt(args[1]);

        if (
            !Number.isInteger(width) ||
            !Number.isInteger(height) ||
            width <= 0 ||
            height <= 0
        ) {

            return ctx.error(
                "Usage: .resize 500 500"
            );

        }

        if (width > 2000 || height > 2000) {

            return ctx.error(
                "Maximum size is 2000x2000."
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            const image =
                await resizeImage(
                    buffer,
                    width,
                    height
                );

            await ctx.send({

                image,

                caption:
                    `📐 Resized to ${width}x${height}.`

            });

        } catch (error) {

            console.error(
                "[RESIZE]",
                error
            );

            return ctx.error(
                "Failed to resize the image."
            );

        }

    }

};