import automationStore from "../../system/automationStore.js";
import { isStatus } from "./helpers.js";


async function handleAutoView(
    socket,
    message
) {

    try {

        /*
         * Only process WhatsApp status messages.
         */

        if (!isStatus(message)) {
            return;
        }


        /*
         * The command system stores settings under
         * the bot/account identity.
         *
         * Prefer the bot LID because the current
         * command configuration is stored as @lid.
         */

        const botLid =
            socket.user?.lid || null;

        const botId =
            socket.user?.id || null;


        const botIdentity =
            botLid || botId;


        if (!botIdentity) {
            return;
        }


        /*
         * Get automation settings for this bot.
         */

        const settings =
            automationStore.get(
                botIdentity
            );


        /*
         * AutoView is disabled.
         */

        if (!settings.autoview) {
            return;
        }


        /*
         * Mark the status as read/viewed.
         */

        await socket.readMessages([
            message.key
        ]);


        console.log(
            `AUTO VIEW: Status viewed by ${botIdentity}`
        );


    } catch (error) {

        console.error(
            "AUTO VIEW ERROR:",
            error.message
        );

    }

}


export default handleAutoView;