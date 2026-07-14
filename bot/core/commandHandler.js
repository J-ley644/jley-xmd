import config from "../config/config.js";
import logger from "../lib/logger.js";
import {
    checkPermission,
    isOwner
} from "../lib/permissions.js";
import createContext from "../system/context.js";
import cooldowns from "../system/cooldowns.js";


let plugins = new Map();



function setPlugins(pluginCollection){

    plugins = pluginCollection;

}



async function handleCommand(
    client,
    message
){

    try{


        const text =
            message.message
            ?.conversation ||
            message.message
            ?.extendedTextMessage
            ?.text ||
            "";



        if(!text.startsWith(config.prefix)){
            return;
        }



        const args =
            text
            .slice(config.prefix.length)
            .trim()
            .split(/\s+/);



        const commandName =
            args.shift()
            .toLowerCase();



        const command =
            plugins.get(commandName);



        if(!command){
            return;
        }



        message.isOwner =
            isOwner(message);



        if(
            !checkPermission(
                message,
                command.permissions
            )
        ){

            await client.sendMessage(
                message.chat,
                {
                    text:
                    "❌ You don't have permission to use this command."
                }
            );

            return;

        }



        const ctx = await createContext(client, message);

    const cooldown =
    command.cooldown || 3;

const result =
    cooldowns.check(
        ctx.sender,
        command.name,
        cooldown
    );

if (!result.allowed) {

    return await ctx.reply(

`⏳ Please wait ${result.remaining}s before using *${command.name}* again.`

    );

}

await command.execute(ctx);



    }catch(error){

        logger.error(
            error
        );

    }

}



export {
    setPlugins,
    handleCommand
};