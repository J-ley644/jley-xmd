import startWhatsApp from "../../../bot/lib/whatsapp.js";
import * as deploymentManager from "./deploymentManager.js";


export async function startBotEngine(deployment){


    const socket =
        await startWhatsApp(
            deployment.id
        );


    const botInstance = {


        deploymentId:
            deployment.id,


        ownerId:
            deployment.ownerId,


        botName:
            deployment.botName,


        socket,


        status:
            "RUNNING",


        startedAt:
            new Date()


    };



    deploymentManager.addBot(

        deployment.id,

        botInstance

    );



    return botInstance;

}






export function stopBotEngine(id){


    const bot =
        deploymentManager.getBot(id);



    if(bot?.socket){


        bot.socket.end();


    }



    deploymentManager.removeBot(id);


}