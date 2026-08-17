import config from "../config/config.js";
import logger from "../lib/logger.js";
import checkPermissions from "../lib/permissions.js";
import createContext from "../system/context.js";
import cooldowns from "../system/cooldowns.js";
import pluginStore from "../system/pluginStore.js";


/*
|--------------------------------------------------------------------------
| Command Reaction Map
|--------------------------------------------------------------------------
|
| Each command category gets an appropriate reaction.
| Individual commands do not need their own reaction code.
|
*/

const commandReactions = {

    general: "⚡",

    group: "👥",

    download: "📥",

    owner: "👑",

    admin: "🛡️",

    tools: "🛠️",

    fun: "🎮",

    automation: "🤖",

    media: "🎬",

    other: "📌"

};


/*
|--------------------------------------------------------------------------
| Get Command Reaction
|--------------------------------------------------------------------------
*/

function getCommandReaction(command) {

    return (
        commandReactions[
            command?.category
        ] ||
        commandReactions.other
    );

}


/*
|--------------------------------------------------------------------------
| Command Handler
|--------------------------------------------------------------------------
*/

async function handleCommand(
    client,
    message
) {

    try {

        /*
        |--------------------------------------------------------------------------
        | Extract Message Text
        |--------------------------------------------------------------------------
        */

        const text =
            message.message
                ?.conversation ||

            message.message
                ?.extendedTextMessage
                ?.text ||

            "";


        /*
        |--------------------------------------------------------------------------
        | Check Prefix
        |--------------------------------------------------------------------------
        */

        if (
            !text.startsWith(
                config.prefix
            )
        ) {

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | Parse Arguments
        |--------------------------------------------------------------------------
        */

        const args =
            text
                .slice(
                    config.prefix.length
                )
                .trim()
                .split(/\s+/);


        /*
        |--------------------------------------------------------------------------
        | Command Name
        |--------------------------------------------------------------------------
        */

        const commandName =
            args
                .shift()
                .toLowerCase();


        /*
        |--------------------------------------------------------------------------
        | Find Command
        |--------------------------------------------------------------------------
        */

        const command =
            pluginStore.get(
                commandName
            );


        /*
        |--------------------------------------------------------------------------
        | Unknown Command
        |--------------------------------------------------------------------------
        */

        if (!command) {

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | Create Command Context
        |--------------------------------------------------------------------------
        */

        const ctx =
            await createContext(
                client,
                message
            );


        /*
        |--------------------------------------------------------------------------
        | React To Command
        |--------------------------------------------------------------------------
        |
        | The reaction happens before permission checking,
        | cooldown checking and command execution.
        |
        | If the reaction fails, the command itself should
        | still continue normally.
        |
        */

        try {

            const emoji =
                getCommandReaction(
                    command
                );

            await ctx.react(
                emoji
            );

        } catch (reactionError) {

            logger.warn(
                reactionError,
                `Failed to react to command: ${command.name}`
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Permission Check
        |--------------------------------------------------------------------------
        */

        const permissionError =
            checkPermissions(
                ctx,
                command
            );


        if (permissionError) {

            return await ctx.reply(
                permissionError
            );

        }


        /*
        |--------------------------------------------------------------------------
        | Cooldown Check
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | Execute Plugin
        |--------------------------------------------------------------------------
        */

        await command.execute(
            ctx
        );


    } catch (error) {

        logger.error(
            error
        );

    }

}


export {
    handleCommand
};