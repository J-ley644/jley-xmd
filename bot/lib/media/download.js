import { downloadMediaMessage } from "@whiskeysockets/baileys";

export async function downloadQuotedMedia(ctx) {

    if (!ctx.isReply) {

        throw new Error("Reply to a media message.");

    }

    if (!ctx.media) {

        throw new Error("No media found.");

    }

    const stream = await downloadMediaMessage(

        {
            message: ctx.quoted
        },

        "buffer",

        {},

        {}

    );

    return stream;

}