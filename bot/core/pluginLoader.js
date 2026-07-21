import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import logger from "../lib/logger.js";
import pluginStore from "../system/pluginStore.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadPlugins() {

    console.log("PLUGIN LOADER VERSION 2");

    const plugins = new Map();

    const pluginsPath = path.join(
        __dirname,
        "../plugins"
    );

    if (!fs.existsSync(pluginsPath)) {
        logger.warn("Plugins directory not found");
        return plugins;
    }

    const categories = fs.readdirSync(pluginsPath);

    for (const category of categories) {

        const categoryPath = path.join(
            pluginsPath,
            category
        );

        if (!fs.statSync(categoryPath).isDirectory()) {
            continue;
        }

        const files = fs.readdirSync(categoryPath);

        console.log(
    "CATEGORY:",
    category,
    "FILES:",
    files
);

        for (const file of files) {

            console.log("FOUND PLUGIN FILE:", category, file);

            if (!file.endsWith(".js")) {
                continue;
            }

            try {

                const pluginPath = path.join(
                    categoryPath,
                    file
                );

                const plugin = await import(
    pathToFileURL(pluginPath).href
);

                const command = plugin.default;

                if (!command || !command.name) {

    logger.warn(
        `Invalid plugin skipped: ${file} (missing name)`
    );

    continue;

}


// Validate category

if (!command.category) {

    logger.warn(
        `Plugin ${command.name} has no category`
    );

    command.category = "general";

}


// Register main command

if (plugins.has(command.name)) {

    logger.warn(
        `Duplicate command skipped: ${command.name}`
    );

    continue;

}


plugins.set(
    command.name,
    command
);

if (Array.isArray(command.aliases)) {

    for (const alias of command.aliases) {

        if (!plugins.has(alias)) {

            plugins.set(alias, command);

        }

    }

}

logger.info(
    `Loaded plugin: ${command.name}`
);

            } catch (error) {

                logger.error(
    error,
    `Failed loading plugin ${file}`
);

            }

        }

    }

    logger.info(`Total plugins loaded: ${plugins.size}`);

    pluginStore.set(plugins);

    return plugins;
}

export default loadPlugins;