import automationStore from "../../system/automationStore.js";
import { isStatus } from "./helpers.js";
import { jidMatch } from "../jid.js";


function getBotIdentities(socket) {

    const identities = [];

    const botId =
        socket.user?.id || null;

    const botLid =
        socket.user?.lid || null;

    if (botId) {
        identities.push(botId);
    }

    if (botLid) {
        identities.push(botLid);
    }

    return identities;

}


function isConfiguredForBot(
    socket
) {

    const identities =
        getBotIdentities(socket);

    for (const identity of identities) {

        const settings =
            automationStore.get(identity);

        if (settings?.autoview === true) {

            return {
                enabled: true,
                identity
            };

        }

    }

    return {
        enabled: false,
        identity: null
    };

}


async function handleAutoView(
    socket,
    message
) {

    try {

        /*
        |----------------------------------------------------------------------
        | Status Detection
        |----------------------------------------------------------------------
        */

        if (!isStatus(message)) {

            return;

        }


        /*
        |----------------------------------------------------------------------
        | Bot Configuration
        |----------------------------------------------------------------------
        |
        | Settings may have been saved using either:
        |
        |   @s.whatsapp.net
        |   @lid
        |
        | Therefore check both identities.
        |
        */

        const configuration =
            isConfiguredForBot(socket);


        if (!configuration.enabled) {

            console.log(
                "AUTO VIEW: Status received but AutoView is disabled."
            );

            return;

        }


        /*
        |----------------------------------------------------------------------
        | Validate Status Key
        |----------------------------------------------------------------------
        */

        if (!message?.key) {

            console.log(
                "AUTO VIEW: Status has no message key."
            );

            return;

        }


        /*
        |----------------------------------------------------------------------
        | Mark Status As Read
        |----------------------------------------------------------------------
        */

        await socket.readMessages([
            message.key
        ]);


        console.log(
            `AUTO VIEW: Status viewed successfully using ${configuration.identity}`
        );


    } catch (error) {

        console.error(
            "AUTO VIEW ERROR:",
            error
        );

    }

}


export default handleAutoView;
