import automationStore from "../../system/automationStore.js";
import {
    isStatus
} from "./helpers.js";


async function handleAutoView(
    socket,
    message
) {

    try {

        /*
         * Ignore anything that is not a WhatsApp status.
         */

        if (!isStatus(message)) {
            return;
        }


        /*
         * The terminal bot stores automation settings
         * using the bot owner's/sender JID.
         *
         * For now, use the socket's own WhatsApp identity.
         */

        const botJid =
            socket.user?.id;


        if (!botJid) {

            console.log(
                "AUTO VIEW: Bot identity unavailable."
            );

            return;

        }


        /*
         * WhatsApp JIDs can contain a device suffix.
         *
         * Example:
         * 2547xxxxxxx:12@s.whatsapp.net
         *
         * Normalize it to:
         * 2547xxxxxxx@s.whatsapp.net
         */

        const ownerJid =
            botJid
                .split(":")[0]
                .replace(/:\d+(?=@)/, "");


        const settings =
            automationStore.get(ownerJid);


        /*
         * AutoView is disabled.
         */

        if (!settings.autoview) {
            return;
        }


        /*
         * Mark the status as viewed/read.
         */

        await socket.readMessages([
            message.key
        ]);


        console.log(
            "AUTO VIEW: Status viewed."
        );


    } catch (error) {

        console.error(
            "AUTO VIEW ERROR:",
            error.message
        );

    }

}


export default handleAutoView;