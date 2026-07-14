import config from "../config/config.js";



function isOwner(message) {


    const sender =
        message.key.participant ||
        message.key.remoteJid;


    if(!config.owner.number){
        return false;
    }


    return sender.includes(
        config.owner.number
    );

}



function checkPermission(
    message,
    permissions={}
){


    if(
        permissions.owner &&
        !isOwner(message)
    ){

        return false;

    }


    return true;

}



export {
    isOwner,
    checkPermission
};