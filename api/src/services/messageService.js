import {
    handleCommand
} from "./commandService.js";


export async function handleMessage(
    sock,
    message
) {

    if (!message?.message) {
        return;
    }


    if (message.key?.fromMe) {
        return;
    }


    const jid =
        message.key?.remoteJid;


    if (!jid) {
        return;
    }


    const content =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        "";

        console.log("INCOMING MESSAGE:", {
    jid,
    content
});


    if (!content.trim()) {
        return;
    }



    const response =
        handleCommand(content);



    if (!response) {
        return;
    }



    // command reaction
    try {

        await sock.sendMessage(
            jid,
            {
                react: {
                    text: "⚡",
                    key: message.key
                }
            }
        );

    } catch(error) {

        console.error(
            "Reaction error:",
            error.message
        );

    }



    await sock.sendMessage(
        jid,
        {
            text: response
        }
    );

}