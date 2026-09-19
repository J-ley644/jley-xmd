import config from "../config/config.js";
import logger from "../lib/logger.js";
import checkPermissions, {
    isBotOwner
} from "../lib/permissions.js";
import createContext from "../system/context.js";
import cooldowns from "../system/cooldowns.js";
import pluginStore from "../system/pluginStore.js";
import automationStore from "../system/automationStore.js";


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

    admin: "🛡️",

    antidelete: "🗑️"

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

    developer: "👑",

    admin: "🛡️",

    tools: "🛠️",

    fun: "🎮",

    automation: "🤖",

    media: "🎬",

    antidelete: "🗑️",

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
| Get Bot Mode
|--------------------------------------------------------------------------
|
| New settings are stored using deploymentId.
|
| Existing installations may still have settings
| stored under the WhatsApp LID/PN identity, so
| those are checked as a backward-compatible fallback.
|
*/

function getBotMode(client) {

    const deploymentId =
        client?.deploymentId;


    /*
     * Stable deployment storage.
     */

    if (deploymentId) {

        const deploymentMode =
            automationStore.getValue(
                deploymentId,
                "mode"
            );

        if (deploymentMode) {

            return deploymentMode;

        }

    }


    /*
     * Backward compatibility for existing
     * WhatsApp-identity-based settings.
     */

    const botIdentities = [

        client?.user?.lid,

        client?.user?.id

    ].filter(Boolean);


    for (
        const identity
        of botIdentities
    ) {

        const savedMode =
            automationStore.getValue(
                identity,
                "mode"
            );

        if (savedMode) {

            return savedMode;

        }

    }


    /*
     * Default behavior remains public.
     */

    return "public";

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

        const commandStartTime =
            Date.now();


        const ctx =
            await createContext(
                client,
                message
            );


        ctx.commandStartTime =
            commandStartTime;


        ctx.command =
            commandName;


        /*
        |--------------------------------------------------------------------------
        | Bot Mode
        |--------------------------------------------------------------------------
        |
        | PRIVATE:
        | Only the bot account can execute commands.
        |
        | PUBLIC:
        | Everyone can execute commands normally.
        |
        | IMPORTANT:
        | This check happens BEFORE reactions and
        | BEFORE plugin execution.
        |
        */

        const botMode =
            getBotMode(client);


        if (
            botMode === "private" &&
            !isBotOwner(ctx)
        ) {

            return;

        }


        /*
        |--------------------------------------------------------------------------
        | React To Command
        |--------------------------------------------------------------------------
        |
        | The reaction happens only after the
        | private-mode gate has passed.
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
                client?.deploymentId,
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