import {
    getActiveSockets,
    isConnected
} from "../../bot/lib/whatsapp.js";

console.log("ACTIVE SOCKETS:", getActiveSockets());

for (const id of getActiveSockets()) {
    console.log(
        "DEPLOYMENT:",
        id,
        "CONNECTED:",
        isConnected(id)
    );
}
