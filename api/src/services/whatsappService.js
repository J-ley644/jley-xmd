import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    Browsers
} from "@whiskeysockets/baileys";

import P from "pino";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

import { handleMessage } from "./messageService.js";
import prisma from "../config/prisma.js";


const sessions = new Map();

const sessionLocks = new Map();


const sessionsRoot =
    path.resolve("./sessions");



if(!fs.existsSync(sessionsRoot)){

    fs.mkdirSync(
        sessionsRoot,
        {
            recursive:true
        }
    );

}




function sessionKey(id){

    return String(id);

}




function generateSessionId(){

    return (
        "JLEY-XMD-" +
        Math.random()
        .toString(36)
        .substring(2,14)
        .toUpperCase()
    );

}




async function createSocket(
    deploymentId,
    state,
    saveCreds
){

    const key =
        sessionKey(deploymentId);



    if(
        sessions.has(key)
    ){

        return sessions.get(key);

    }




    const session = {

        deploymentId:key,

        sock:null,

        status:"connecting",

        qr:null,

        ready:false

    };





    const sock =
        makeWASocket({

            auth:state,


            browser:
                Browsers.macOS(
                    "Desktop"
                ),


            printQRInTerminal:false,


            generateHighQualityLinkPreview:false,


            logger:P({

                level:"silent"

            })

        });





    session.sock = sock;


    sessions.set(
        key,
        session
    );






    sock.ev.on(
        "creds.update",
        saveCreds
    );






    sock.ev.on(
        "messages.upsert",
        async({messages})=>{


            for(
                const message of messages
            ){

                try{


                    await handleMessage(
                        sock,
                        message
                    );


                }catch(error){


                    console.error(
                        "Message error:",
                        error.message
                    );


                }


            }


        }
    );







    sock.ev.on(
        "connection.update",
        async(update)=>{


            const {

                connection,

                qr,

                lastDisconnect

            } = update;





            console.log(
                "WHATSAPP UPDATE:",
                {

                    connection,

                    qr:!!qr,

                    error:
                    lastDisconnect
                    ?.error
                    ?.message

                }
            );








            if(qr){


                session.qr =
                    await QRCode.toDataURL(
                        qr
                    );


                session.status =
                    "qr_ready";


                console.log(
                    "QR READY"
                );


            }









            if(connection==="open"){



                session.status =
                    "connected";


                session.ready =
                    true;


                session.qr =
                    null;





                try{


                    const deployment =
                        await prisma.deployment.findUnique({

                            where:{
                                id:key
                            }

                        });





                    if(!deployment){

                        console.log(
                            "Deployment not found:",
                            key
                        );

                        return;

                    }





                    let sessionId =
                        deployment.sessionId;





                    if(!sessionId){

                        sessionId =
                            generateSessionId();

                    }








                    await prisma.deployment.update({

                        where:{
                            id:key
                        },


                        data:{


                            sessionId,


                            sessionReady:true,


                            status:"RUNNING",


                            connectionStatus:"CONNECTED",


                            activatedAt:
                                deployment.activatedAt ??
                                new Date(),


                            lastConnected:
                                new Date()


                        }


                    });







                    await sock.sendMessage(

                        sock.user.id,

                        {

                            text:

`🎉 JLEY-XMD Connected


Deployment:

${deployment.botName}


Session ID:

${sessionId}


Keep this safe.`

                        }

                    );




                }catch(error){


                    console.error(
                        "Connection save error:",
                        error.message
                    );


                }


            }







            if(connection==="close"){


                session.ready = false;


                session.status =
                    "offline";


                session.qr = null;



                const code =
                    lastDisconnect
                    ?.error
                    ?.output
                    ?.statusCode;



                console.log(
                    "WhatsApp disconnected:",
                    code
                );



                sessions.delete(key);





                if(
                    code === DisconnectReason.loggedOut
                ){

                    console.log(
                        "Logged out session removed"
                    );

                }


            }




        }
    );





    return session;

}

async function createSession(
    deploymentId
){


    const key =
        sessionKey(deploymentId);





    if(
        sessions.has(key)
    ){

        return sessions.get(key);

    }





    if(
        sessionLocks.has(key)
    ){

        return sessionLocks.get(key);

    }







    const promise =
        (async()=>{


            const sessionPath =
                path.join(
                    sessionsRoot,
                    key
                );




            const {
                state,
                saveCreds

            } =
            await useMultiFileAuthState(
                sessionPath
            );





            return createSocket(

                deploymentId,

                state,

                saveCreds

            );



        })();







    sessionLocks.set(
        key,
        promise
    );







    try{


        const session =
            await promise;


        return session;



    }finally{


        sessionLocks.delete(
            key
        );


    }


}









export async function startDeploymentSession(
    deploymentId
){


    const session =
        await createSession(
            deploymentId
        );



    return {


        deploymentId:
            session.deploymentId,


        status:
            session.status,


        qr:
            session.qr


    };


}









export async function requestPairingCode(
    deploymentId,
    phoneNumber
){

    const session =
        await createSession(
            deploymentId
        );


    if(!session.sock){

        throw new Error(
            "WhatsApp socket unavailable"
        );

    }


    await new Promise(resolve =>
        setTimeout(resolve,3000)
    );


    try {


        const code =
            await session.sock.requestPairingCode(

                phoneNumber.replace(
                    /\D/g,
                    ""
                )

            );


        await prisma.deployment.update({

            where:{
                id:String(deploymentId)
            },


            data:{

                phoneNumber,

                pairingCode:code

            }

        });



        return {

            code

        };


    }catch(error){


        console.error(
            "Pairing code generation failed:",
            error.message
        );


        throw new Error(
            "Failed to generate pairing code"
        );

    }

}



export async function getDeploymentStatus(
    deploymentId
){


    const session =
        sessions.get(
            sessionKey(deploymentId)
        );





    if(!session){


        return {


            status:"offline",


            qr:null


        };


    }






    return {


        status:
            session.status,


        qr:
            session.qr


    };


}









export async function stopDeploymentSession(
    deploymentId
){


    const key =
        sessionKey(deploymentId);





    const session =
        sessions.get(key);





    if(
        !session
    ){

        return false;

    }







    try{


        await session.sock.logout();


    }catch{}




    sessions.delete(key);




    return true;


}









export async function restoreWhatsAppSessions(){



    const deployments =
        await prisma.deployment.findMany({

            where:{


                status:"RUNNING",


                sessionReady:true


            }


        });






    for(
        const deployment of deployments
    ){


        try{


            await createSession(
                deployment.id
            );


            console.log(
                "Restored session:",
                deployment.id
            );


        }catch(error){


            console.error(

                "Restore session failed:",
                deployment.id,
                error.message

            );


        }


    }


}