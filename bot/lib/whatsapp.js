import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} from "@whiskeysockets/baileys";

import qrcode from "qrcode-terminal";
import path from "path";
import { fileURLToPath } from "url";

import logger from "./logger.js";
import config from "../config/config.js";

import { handleCommand } from "../core/commandHandler.js";

import groupSettings from "../system/groupSettings.js";
import { containsLink } from "./antiLink.js";



const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);





/*
    JLEY WhatsApp Engine

    Every deployment receives:
    - own session
    - own socket
    - own identity
*/


async function startWhatsApp(deploymentId) {


    const sessionName =
    deploymentId || "main";


const sessionPath =
    path.join(
        __dirname,
        "../sessions",
        sessionName
    );



    const { state, saveCreds } =
        await useMultiFileAuthState(
            sessionPath
        );



    const { version } =
        await fetchLatestBaileysVersion();




    const socket =
        makeWASocket({

            version,

            auth: state,


            browser:[
                "JLEY-XMD",
                "Dashboard",
                config.version
            ]

        });




    /*
        Save WhatsApp credentials
    */


    socket.ev.on(
        "creds.update",
        saveCreds
    );




    /*
        Connection handler
    */


    socket.ev.on(
        "connection.update",
        async(update)=>{


            const {
                connection,
                lastDisconnect,
                qr
            } = update;




            if(qr){


                logger.info(
                    `QR generated for deployment ${deploymentId}`
                );


                /*
                    Temporary terminal QR

                    Later replaced by:
                    Dashboard QR API
                */


                qrcode.generate(
                    qr,
                    {
                        small:true
                    }
                );


            }




            if(connection==="open"){


                logger.info(
                    `✅ Deployment ${deploymentId} connected`
                );


            }





            if(connection==="close"){


                const reconnect =
                    lastDisconnect
                    ?.error
                    ?.output
                    ?.statusCode
                    !== DisconnectReason.loggedOut;



                logger.warn(
                    `Deployment ${deploymentId} disconnected`
                );



                if(reconnect){


                    logger.info(
                        "Restarting connection..."
                    );


                    startWhatsApp(
                        deploymentId
                    );


                }


            }


        }
    );




    /*
        Message Engine

        All incoming messages enter here

        Later:
        Dashboard logs
        AI engine
        Plugin engine
        Analytics
    */


    socket.ev.on(
        "messages.upsert",
        async({messages})=>{


            const message =
                messages[0];



            if(!message.message)
                return;



            message.chat =
                message.key.remoteJid;




            await processMessage(
                socket,
                message
            );



        }
    );






/*
    Group Events Engine

    Handles:
    - welcome
    - goodbye
    - future group automation
*/


socket.ev.on(
"group-participants.update",
async(update)=>{


    try{


        const {
            id,
            participants,
            action
        } = update;



        const settings =
            groupSettings.get(id);



        if(!settings)
            return;




        /*
            Get group name

            Instead of:
            "Welcome to the group"

            We now get:
            "Welcome to JLEY Developers"
        */


        const metadata =
            await socket.groupMetadata(id);



        const groupName =
            metadata.subject;





        if(
            action==="add"
            &&
            settings.welcome
        ){



            for(const user of participants){



                const jid =
                    typeof user==="string"
                    ? user
                    : user.id;



                const number =
                    jid.split("@")[0];




                await socket.sendMessage(

                    id,

                    {


text:
`🤖 ${config.botName}

👋 Welcome @${number}

You joined:
📌 ${groupName}

Enjoy your stay ❤️`,



mentions:[
    jid
]


                    }

                );


            }


        }





        if(
            action==="remove"
            &&
            settings.goodbye
        ){



            for(const user of participants){



                const jid =
                    typeof user==="string"
                    ? user
                    : user.id;




                const number =
                    jid.split("@")[0];




                await socket.sendMessage(

                    id,

                    {

text:
`🤖 ${config.botName}

👋 Goodbye @${number}

Left:
📌 ${groupName}

We'll miss you ❤️`,


mentions:[
    jid
]


                    }

                );



            }


        }




    }catch(error){


        logger.error(
            error,
            "Group event error"
        );


    }


});





/*
    Return socket

    DeploymentManager will store this

    Future:

    deploymentManager.addBot(
        id,
        socket
    )

*/


return socket;



}






/*
    Message Processing Layer

    This keeps whatsapp.js clean

    Later this becomes:
    JLEY Engine
*/


async function processMessage(
    socket,
    message
){



try{



const chat =
    message.key.remoteJid;



const sender =
    message.key.participant ||
    message.key.remoteJid;



const text =
    message.message?.conversation ||
    message.message?.extendedTextMessage?.text ||
    "";





/*
    Anti-Link System
*/


if(chat.endsWith("@g.us")){


    const settings =
        groupSettings.get(chat);



    if(
        settings?.antilink
    ){



        const metadata =
            await socket.groupMetadata(chat);



        const participant =
            metadata.participants.find(
                p =>
                p.id===sender
            );



        const isAdmin =
            participant?.admin;



        if(
            containsLink(text)
            &&
            !isAdmin
        ){



            await socket.sendMessage(

                chat,

                {
                    delete:
                    message.key
                }

            );




            await socket.sendMessage(

                chat,

                {

text:
`🚫 Links are not allowed here.

@${sender.split("@")[0]} please remove the link.`,

mentions:[
    sender
]

                }

            );



            return;

        }


    }


}





/*
    JLEY Command Engine

    Every command/plugin enters here
*/


await handleCommand(
    socket,
    message
);



}catch(error){


logger.error(
    error,
    "Message engine error"
);



}



}





export default startWhatsApp;