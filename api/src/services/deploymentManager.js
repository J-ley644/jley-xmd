const runningBots = new Map();


export function addBot(
    deploymentId,
    botInstance
){

    runningBots.set(
        deploymentId,
        botInstance
    );

}



export function getBot(
    deploymentId
){

    return runningBots.get(
        deploymentId
    );

}



export function updateBot(
    deploymentId,
    updates
){

    const bot =
        runningBots.get(deploymentId);


    if(!bot){
        return null;
    }


    const updated = {
        ...bot,
        ...updates
    };


    runningBots.set(
        deploymentId,
        updated
    );


    return updated;

}



export function removeBot(
    deploymentId
){

    const bot =
        runningBots.get(deploymentId);


    if(bot?.socket){

        try {

            bot.socket.end();

        } catch(error){

            console.log(
                "Socket close error",
                error
            );

        }

    }


    runningBots.delete(
        deploymentId
    );

}



export function getAllBots(){

    return Array.from(
        runningBots.values()
    );

}



export function isRunning(
    deploymentId
){

    return runningBots.has(
        deploymentId
    );

}



export function getRunningCount(){

    return runningBots.size;

}