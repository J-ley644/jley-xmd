import config from "../config/config.js";
import logger from "../lib/logger.js";
import checkPermissions from "../lib/permissions.js";
import createContext from "../system/context.js";
import cooldowns from "../system/cooldowns.js";
import pluginStore from "../system/pluginStore.js";


/*
|--------------------------------------------------------------------------
| Command-Specific Reactions
|--------------------------------------------------------------------------
|
| These take priority over category reactions.
|
*/

const commandReactions = {

    menu: "📋",

    commands: "📋",

    list: "📋",

    help: "📚",

    ping: "🏓",

    play: "🎵",

    vv: "👁️",

    sticker: "🖼️",

    download: "📥",

    song: "🎵",

    video: "🎬",

    photo: "📷",

    image: "🖼️",

    group: "👥",

    settings: "⚙️",

    plugins: "🧩",

    owner: "👑",

    admin: "🛡️"

};


/*
|--------------------------------------------------------------------------
| Category Fallback Reactions
|--------------------------------------------------------------------------
*/

const categoryReactions = {

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

    const commandName =
        command?.name
            ?.toLowerCase();

    if (
        commandName &&
        commandReactions[commandName]
    ) {

        return commandReactions[
            commandName
        ];

    }

    return (
        categoryReactions[
            command?.category
        ] ||
        categoryReactions.other
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
                ?.toLowerCase();


        if (!commandName) {

            return;

        }


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
        | The reaction happens immediately after
        | the command is recognized.
        |
        | A reaction failure must never prevent
        | the command itself from executing.
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