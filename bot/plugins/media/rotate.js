import ffmpegPath from "ffmpeg-static";
import { spawn } from "child_process";

function rotateImage(buffer, angle) {

    let filter;

    if (angle === 90) {
        filter = "transpose=1";
    } else if (angle === 180) {
        filter = "transpose=1,transpose=1";
    } else if (angle === 270) {
        filter = "transpose=2";
    } else {
        throw new Error("Invalid rotation angle");
    }

    return new Promise((resolve, reject) => {

        const ffmpeg = spawn(ffmpegPath, [
            "-i", "pipe:0",
            "-vf", filter,
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

    name: "rotate",

    aliases: ["rot"],

    category: "media",

    description: "Rotate an image.",

    usage: ".rotate 90",

    cooldown: 10,

    permissions: {},

    async execute(ctx) {

        if (!ctx.isReply || !ctx.isImage) {

            return ctx.error(
                "Reply to an image with .rotate 90"
            );

        }

        const args = ctx.args || [];

        const angle =
            parseInt(args[0]) || 90;

        if (![90, 180, 270].includes(angle)) {

            return ctx.error(
                "Use 90, 180, or 270 degrees."
            );

        }

        try {

            const buffer =
                await ctx.downloadBuffer();

            const image =
                await rotateImage(
                    buffer,
                    angle
                );

            await ctx.send({

                image,

                caption:
                    `🔄 Rotated ${angle}°.`

            });

        } catch (error) {

            console.error(
                "[ROTATE]",
                error
            );

            return ctx.error(
                "Failed to rotate the image."
            );

        }

    }

};