import { isGroup } from "./permissions.js";
import logger from "./logger.js";


function isGroup(message) {
    return message.chat?.endsWith("@g.us");
}

async function getGroupMetadata(client, jid) {

    try {

        const metadata =
            await client.groupMetadata(jid);

        return metadata;


    } catch(error) {

        logger.error(
            "Failed getting group metadata",
            error
        );

        return null;

    }

}



async function getAdmins(client, jid) {


    const metadata =
        await getGroupMetadata(
            client,
            jid
        );


    if(!metadata){
        return [];
    }


    return metadata.participants
        .filter(
            participant =>
            participant.admin === "admin" ||
            participant.admin === "superadmin"
        )
        .map(
            participant =>
            participant.id
        );

}



async function isAdmin(client, message) {


    if(!isGroup(message)){
        return false;
    }


    const admins =
        await getAdmins(
            client,
            message.chat
        );


    const sender =
        message.key.participant;


    return admins.includes(sender);

}



async function isBotAdmin(client, message) {


    if(!isGroup(message)){
        return false;
    }


    const admins =
        await getAdmins(
            client,
            message.chat
        );


    const bot =
        client.user.id
        .split(":")[0]
        +
        "@s.whatsapp.net";


    return admins.includes(bot);

}



export {
    isGroup,
    getGroupMetadata,
    getAdmins,
    isAdmin,
    isBotAdmin
};