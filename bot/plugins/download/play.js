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

        try {

            if (!ctx.args.length) {

                return ctx.reply(
                    "Example:\n.play Faded Alan Walker"
                );

            }


            const query =
                ctx.args.join(" ");


            await ctx.react("⏳");


            const video =
                await searchYouTube(query);



            const tempDir =
                path.join(
                    process.cwd(),
                    "temp"
                );


            if (!fs.existsSync(tempDir)) {

                fs.mkdirSync(
                    tempDir,
                    {
                        recursive:true
                    }
                );

            }


            const input =
                path.join(
                    tempDir,
                    `${Date.now()}.webm`
                );


            const output =
                input.replace(
                    ".webm",
                    ".mp3"
                );



            console.log(
                "[PLAY] Downloading:",
                video.url
            );



            await ytdlp(
                video.url,
                {
                    format:"bestaudio",
                    output:input,
                    quiet:true
                }
            );



            console.log(
                "[PLAY] Converting..."
            );



            await new Promise(
                (resolve,reject)=>{

                    ffmpeg(input)

                    .audioCodec(
                        "libmp3lame"
                    )

                    .audioBitrate(128)

                    .save(output)

                    .on(
                        "end",
                        resolve
                    )

                    .on(
                        "error",
                        reject
                    );

                }
            );



            await ctx.send({

                audio:
                    fs.readFileSync(output),

                mimetype:
                    "audio/mpeg",

                fileName:
                    `${video.title}.mp3`

            });



            fs.unlinkSync(input);

            fs.unlinkSync(output);



            await ctx.react("✅");


        } catch(error) {


            console.error(
                "[PLAY ERROR]",
                error
            );


            await ctx.react("❌");


            await ctx.reply(
                "❌ Failed to download audio."
            );

        }

    }

};