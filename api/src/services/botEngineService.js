import startWhatsApp from "../../../bot/lib/whatsapp.js";
import prisma from "../config/prisma.js";
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



    await prisma.deployment.update({

        where:{
            id: deployment.id
        },

        data:{

            status:"RUNNING"

        }

    });



    return botInstance;

}






export async function stopBotEngine(id){


    const bot =
        deploymentManager.getBot(id);



    if(bot?.socket){


        try{

            await bot.socket.logout();

        }catch(error){

            console.log(
                "Socket logout failed",
                error.message
            );

        }

    }



    deploymentManager.removeBot(id);



    await prisma.deployment.update({

        where:{
            id
        },

        data:{

            status:"STOPPED"

        }

    });


}