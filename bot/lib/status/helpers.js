function isStatus(message) {

    if (!message)
        return false;

    return (

        message.key?.remoteJid ===
        "status@broadcast"

        ||

        message.key?.remoteJid?.endsWith(
            "status@broadcast"
        )

    );

}




function getStatusOwner(message) {

    return (

        message.key?.participant ||

        message.participant ||

        message.key?.remoteJid ||

        null

    );

}




export {

    isStatus,

    getStatusOwner

};