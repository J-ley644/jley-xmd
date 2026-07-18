import startWhatsApp from "../lib/whatsapp.js";
import logger from "../lib/logger.js";


const bots = new Map();



export async function startBot(deploymentId) {

    if (bots.has(deploymentId)) {

        return bots.get(deploymentId);

    }


    logger.info(
        `Starting deployment bot: ${deploymentId}`
    );


    const socket =
        await startWhatsApp(
            deploymentId
        );


    bots.set(
        deploymentId,
        socket
    );


    return socket;

}




export async function stopBot(deploymentId) {


    const socket =
        bots.get(deploymentId);


    if(!socket){

        return false;

    }


    try {

        await socket.logout();

    } catch(error){

        logger.error(error);

    }


    bots.delete(
        deploymentId
    );


    return true;

}




export function getBot(deploymentId){

    return bots.get(
        deploymentId
    );

}



export function getAllBots(){

    return [
        ...bots.keys()
    ];

}