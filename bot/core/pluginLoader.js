import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

import logger from "../lib/logger.js";
import pluginStore from "../system/pluginStore.js";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


/*
|--------------------------------------------------------------------------
| Load Plugins
|--------------------------------------------------------------------------
|
| Loads every JavaScript plugin from:
|
| bot/plugins/<category>/*.js
|
| Each plugin can have:
|
| name: "play"
| aliases: ["song"]
|
| Both the main command and aliases are registered.
|
|--------------------------------------------------------------------------
*/

async function loadPlugins() {

    console.log(
        "PLUGIN LOADER VERSION 3"
    );


    const plugins =
        new Map();


    const pluginsPath =
        path.join(
            __dirname,
            "../plugins"
        );


    if (
        !fs.existsSync(
            pluginsPath
        )
    ) {

        logger.warn(
            "Plugins directory not found"
        );

        return plugins;

    }


    const categories =
        fs.readdirSync(
            pluginsPath,
            {
                withFileTypes: true
            }
        );


    for (
        const categoryEntry
        of categories
    ) {

        if (
            !categoryEntry.isDirectory()
        ) {
            continue;
        }


        const category =
            categoryEntry.name;


        const categoryPath =
            path.join(
                pluginsPath,
                category
            );


        const files =
            fs.readdirSync(
                categoryPath,
                {
                    withFileTypes: true
                }
            );


        console.log(
            "CATEGORY:",
            category,
            "FILES:",
            files.map(
                file => file.name
            )
        );


        for (
            const fileEntry
            of files
        ) {

            const file =
                fileEntry.name;


            if (
                !fileEntry.isFile() ||
                !file.endsWith(".js")
            ) {
                continue;
            }


            console.log(
                "FOUND PLUGIN FILE:",
                category,
                file
            );


            try {

                const pluginPath =
                    path.join(
                        categoryPath,
                        file
                    );


                const plugin =
                    await import(
                        pathToFileURL(
                            pluginPath
                        ).href
                    );


                const command =
                    plugin.default;


                /*
                |--------------------------------------------------------------------------
                | Validate Plugin
                |--------------------------------------------------------------------------
                */

                if (
                    !command ||
                    !command.name
                ) {

                    logger.warn(
                        `Invalid plugin skipped: ${file} (missing name)`
                    );

                    continue;

                }


                const commandName =
                    String(
                        command.name
                    )
                        .trim()
                        .toLowerCase();


                if (!commandName) {

                    logger.warn(
                        `Invalid plugin skipped: ${file} (empty name)`
                    );

                    continue;

                }


                /*
                |--------------------------------------------------------------------------
                | Validate Category
                |--------------------------------------------------------------------------
                */

                if (
                    !command.category
                ) {

                    logger.warn(
                        `Plugin ${commandName} has no category`
                    );

                    command.category =
                        "general";

                }


                /*
                |--------------------------------------------------------------------------
                | Register Main Command
                |--------------------------------------------------------------------------
                */

                if (
                    plugins.has(
                        commandName
                    )
                ) {

                    logger.warn(
                        `Duplicate command skipped: ${commandName}`
                    );

                    continue;

                }


                plugins.set(
                    commandName,
                    command
                );


                /*
                |--------------------------------------------------------------------------
                | Register Aliases
                |--------------------------------------------------------------------------
                */

                if (
                    Array.isArray(
                        command.aliases
                    )
                ) {

                    for (
                        const alias
                        of command.aliases
                    ) {

                        const aliasName =
                            String(
                                alias || ""
                            )
                                .trim()
                                .toLowerCase();


                        if (!aliasName) {
                            continue;
                        }


                        /*
                        |----------------------------------------------------------------------
                        | Prevent Alias From Overwriting A Real Command
                        |----------------------------------------------------------------------
                        */

                        if (
                            plugins.has(
                                aliasName
                            )
                        ) {

                            logger.warn(
                                `Alias "${aliasName}" for "${commandName}" conflicts with an existing command. Alias skipped.`
                            );

                            continue;

                        }


                        plugins.set(
                            aliasName,
                            command
                        );


                        logger.info(
                            `Registered alias: ${aliasName} -> ${commandName}`
                        );

                    }

                }


                logger.info(
                    `Loaded plugin: ${commandName}`
                );


            } catch (error) {

                logger.error(
                    error,
                    `Failed loading plugin ${file}`
                );

            }

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Final Plugin Registry
    |--------------------------------------------------------------------------
    */

    logger.info(
        `Total commands and aliases loaded: ${plugins.size}`
    );


    pluginStore.set(
        plugins
    );


    return plugins;

}


export default loadPlugins;