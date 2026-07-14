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


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



async function startWhatsApp() {


    const sessionPath =
        path.join(
            __dirname,
            "../sessions"
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

            printQRInTerminal: false,

            browser: [
                "JLEY-XMD",
                "Chrome",
                "1.0.0"
            ]

        });



    socket.ev.on(
        "creds.update",
        saveCreds
    );



    socket.ev.on(
        "connection.update",
        (update) => {


            const {
                connection,
                lastDisconnect,
                qr
            } = update;



            if(qr){

                logger.info(
                    "Scan the QR code below:"
                );


                qrcode.generate(
                    qr,
                    {
                        small:true
                    }
                );

            }



            if(connection === "open"){

                logger.info(
                    "✅ WhatsApp connected"
                );

            }



            if(connection === "close"){


                const shouldReconnect =
                    lastDisconnect
                    ?.error
                    ?.output
                    ?.statusCode
                    !== DisconnectReason.loggedOut;



                logger.warn(
                    "WhatsApp connection closed"
                );



                if(shouldReconnect){

                    logger.info(
                        "Reconnecting..."
                    );

                    startWhatsApp();

                }

            }


        }
    );



    socket.ev.on(
        "messages.upsert",
        async ({messages}) => {


            const message =
                messages[0];


            if(!message.message){
                return;
            }


            message.chat =
                message.key.remoteJid;



            await handleCommand(
                socket,
                message
            );


        }
    );



    return socket;

}



export default startWhatsApp;