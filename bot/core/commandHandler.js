import config from "../config/config.js";
import logger from "../lib/logger.js";
import checkPermissions from "../lib/permissions.js";
import createContext from "../system/context.js";
import cooldowns from "../system/cooldowns.js";
import pluginStore from "../system/pluginStore.js";


async function handleCommand(
    client,
    message
){

    console.log("🔥 HANDLE COMMAND REACHED");

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

            console.log(
    "PLUGIN STORE CURRENT SIZE:",
    pluginStore.size()
);



        const command =
    pluginStore.get(commandName);

    console.log("COMMAND DEBUG:", {
    text,
    commandName,
    found: Boolean(command),
    command: command?.name
});



        if(!command){
            return;
        }



        // Create command context first
        const ctx =
            await createContext(
                client,
                message
            );



        // Permission check
        const permissionError =
            checkPermissions(
                ctx,
                command
            );



        if(permissionError){

            return await ctx.reply(
                permissionError
            );

        }



        // Cooldown check

        const cooldown =
            command.cooldown || 3;



        const result =
            cooldowns.check(
                ctx.sender,
                command.name,
                cooldown
            );



        if(!result.allowed){

            return await ctx.reply(

`⏳ Please wait ${result.remaining}s before using *${command.name}* again.`

            );

        }



        // Execute plugin

        await command.execute(ctx);



    }catch(error){

        logger.error(error);

    }

}



export {
    handleCommand
};