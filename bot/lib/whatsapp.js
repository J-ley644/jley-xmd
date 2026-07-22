import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    delay
} from "@whiskeysockets/baileys";

import qrcode from "qrcode-terminal";
import path from "path";
import { fileURLToPath } from "url";

import logger from "./logger.js";
import config from "../config/config.js";

import { handleCommand } from "../core/commandHandler.js";

import groupSettings from "../system/groupSettings.js";
import { containsLink } from "./antiLink.js";
import loadPlugins from "../core/pluginLoader.js";
import pluginStore from "../system/pluginStore.js";


const __filename =
fileURLToPath(import.meta.url);


const __dirname =
path.dirname(__filename);



/*
================================================

        JLEY-XMD WHATSAPP ENGINE

================================================

Features:

✓ Multi deployment support
✓ QR pairing
✓ Session auth
✓ Dashboard integration
✓ Safe database updates
✓ Reconnect handling

================================================
*/
const sockets =
new Map();


import prisma from "../../api/src/config/prisma.js";

async function safeDeploymentUpdate(deploymentId, data) {

    try {

        await prisma.deployment.update({

            where: {
                id: deploymentId
            },

            data

        });

    } catch (error) {

        console.log("Deployment update failed:", error.message);

    }

}



async function startWhatsApp(
    deploymentId="main"
){



console.log(
    "🔥 WHATSAPP START DEPLOYMENT ID:",
    deploymentId
);

if (pluginStore.size() === 0) {
    await loadPlugins();
}

const sessionPath =
path.join(
    __dirname,
    "../sessions",
    deploymentId
);





const {
    state,
    saveCreds
}
=
await useMultiFileAuthState(
    sessionPath
);





const {
    version
}
=
await fetchLatestBaileysVersion();






const socket =
makeWASocket({

    version,

    auth:state,


    browser:[
        "JLEY-XMD",
        "Dashboard",
        config.version
    ]

});

/*
=========================================
SESSION ID PAIRING
=========================================
*/



sockets.set(
    deploymentId,
    socket
);





socket.ev.on(
"creds.update",
saveCreds
);





socket.ev.on(
"connection.update",
async(update)=>{


const {
    connection,
    qr,
    lastDisconnect
}
=
update;





if(qr){


logger.info(
{
deploymentId
},
"QR Generated"
);




await safeDeploymentUpdate(
deploymentId,
{

qrCode:qr,

sessionReady:false,

status:"PENDING"

}
);



try{

await safeDeploymentUpdate(
    deploymentId,
    {
        qrCode: qr,
        sessionReady:false,
        status:"PENDING"
    }
);


}catch{}





qrcode.generate(
qr,
{
small:true
}
);



}




if(connection==="open"){



logger.info(
{
deploymentId
},
"✅ WhatsApp Connected"
);




await safeDeploymentUpdate(
deploymentId,
{

qrCode:null,

sessionReady:true,

status:"RUNNING",

lastConnected:new Date()

}
);




try{

await safeDeploymentUpdate(
    deploymentId,
    {
        qrCode:null,
        sessionReady:true,
        status:"RUNNING",
        lastConnected:new Date()
    }
);


}catch{}



}




if(connection==="close"){



const code =
lastDisconnect
?.error
?.output
?.statusCode;



logger.warn(
{
deploymentId,
code
},
"WhatsApp disconnected"
);





const reconnect =
code !== DisconnectReason.loggedOut;




if(reconnect){


setTimeout(
()=>{

startWhatsApp(
deploymentId
);

},
3000
);


}else{


sockets.delete(
deploymentId
);


}



}



});



/*
================================================

        MESSAGE EVENT ENGINE

================================================
*/


socket.ev.on(
"messages.upsert",
async({messages})=>{


try{
    console.log("📩 MESSAGE RECEIVED", messages[0]?.key);


for(const message of messages){



if(!message.message)
    continue;



message.chat =
message.key.remoteJid;



await processMessage(
socket,
message
);



}



}catch(error){


logger.error(
error,
"Message event failed"
);



}



});






/*
================================================

        GROUP AUTOMATION ENGINE

================================================
*/


socket.ev.on(
"group-participants.update",
async(update)=>{


try{


const {
id,
participants,
action
}
=
update;




const settings =
groupSettings.get(id);



if(!settings)
    return;





const metadata =
await socket.groupMetadata(id);



const groupName =
metadata.subject;





for(const participant of participants){



const jid =
typeof participant === "string"
?
participant
:
participant.id;



const number =
jid.split("@")[0];







if(
action==="add"
&&
settings.welcome
){



await socket.sendMessage(
id,
{


text:
`🤖 ${config.botName}

👋 Welcome @${number}

📌 Group:
${groupName}

Enjoy your stay ❤️`,


mentions:[
jid
]


}

);



}





if(
action==="remove"
&&
settings.goodbye
){



await socket.sendMessage(
id,
{


text:
`🤖 ${config.botName}

👋 Goodbye @${number}

📌 Left:
${groupName}

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
"Group automation failed"
);



}



});







return socket;



}






/*
================================================

        MESSAGE PROCESSOR

================================================
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
message.participant ||
message.key.remoteJid;


const botJid = socket.user.id;
const botLid = socket.user.lid;

const normalize = (id = "") =>
    id
        .replace(/:\d+@/, "@")
        .replace(/lid$/, "s.whatsapp.net")
        .toLowerCase();

if (
    normalize(sender) === normalize(botJid)
) {
    return;
}

logger.info(
{
    chat,
    sender
},
"Message identity check"
);





const text =

message.message?.conversation

||

message.message
?.extendedTextMessage
?.text

||

message.message
?.imageMessage
?.caption

||

"";

console.log("MESSAGE TEXT:", text);




/*
================================================

        ANTI LINK SYSTEM

================================================
*/


if(
chat.endsWith("@g.us")
){



const settings =
groupSettings.get(chat);



if(settings?.antilink){



const metadata =
await socket.groupMetadata(chat);





const member =
metadata.participants.find(
    p =>
        normalize(p.id) === normalize(sender) ||
        normalize(p.lid) === normalize(sender)
);





const isAdmin =
    member?.admin === "admin" ||
    member?.admin === "superadmin";

const isBot =
    normalize(sender) === normalize(botJid) ||
    (botLid && normalize(sender) === normalize(botLid)) ||
    message.key.fromMe;


if (
    containsLink(text) &&
    !isAdmin &&
    !isBot
) {



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
`🚫 Links are not allowed.

@${sender.split("@")[0]} remove the link.`,

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
================================================

        COMMAND ENGINE

================================================
*/
console.log({
    deployment: socket.user.id,
    fromMe: message.key.fromMe,
    remoteJid: message.key.remoteJid,
    participant: message.key.participant,
    remoteJidAlt: message.key.remoteJidAlt
});

await handleCommand(
socket,
message
);



}catch(error){



logger.error(
error,
"Message processing error"
);



}



}

/*
================================================

        SOCKET MANAGEMENT

================================================
*/


function getSocket(
deploymentId
){

return sockets.get(
deploymentId
);

}





function removeSocket(
deploymentId
){

sockets.delete(
deploymentId
);

}







function getActiveSockets()
{

return [
...sockets.keys()
];

}






/*
================================================

        DEPLOYMENT STARTER

================================================

Used by:

- Dashboard deploy system
- Main bot
- Future worker manager

================================================
*/


async function launchWhatsApp(
deploymentId="main"
){



const existing =
getSocket(
deploymentId
);



if(existing){


logger.warn(
{
deploymentId
},
"Deployment already running"
);



return existing;


}





const socket =
await startWhatsApp(
deploymentId
);



return socket;



}







/*
================================================

        HEALTH CHECK

================================================
*/


function isConnected(
deploymentId
){



const socket =
getSocket(
deploymentId
);



return Boolean(
socket?.user
);



}




/*
================================================

        EXPORTS

================================================
*/


export {
    startWhatsApp,
    launchWhatsApp,
    getSocket,
    removeSocket,
    getActiveSockets,
    isConnected,
};



export default startWhatsApp;
