import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../lib/logger.js";
import pluginStore from "../system/pluginStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function loadPlugins() {

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

        for (const file of files) {

            if (!file.endsWith(".js")) {
                continue;
            }

            try {

                const pluginPath = path.join(
                    categoryPath,
                    file
                );

                const plugin = await import(
                    `file://${pluginPath}`
                );

                const command = plugin.default;

                if (!command || !command.name) {
                    logger.warn(`Invalid plugin skipped: ${file}`);
                    continue;
                }

                plugins.set(command.name, command);

                logger.info(`Loaded plugin: ${command.name}`);

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