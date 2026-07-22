/**
 * JLEY-XMD Plugin Store
 * ---------------------
 * Central registry for all loaded plugins.
 * Every part of the bot accesses plugins through here.
 */

class PluginStore {

    constructor() {
        this.plugins = new Map();
    }


    /**
     * Replace all loaded plugins.
     */
    set(plugins) {

    console.log(
        "PLUGIN STORE SET SIZE:",
        plugins.size
    );

    this.plugins = plugins;
}


    /**
     * Get all registered commands including aliases.
     * Used by command execution.
     */
    getAll() {
        return this.plugins;
    }


    /**
     * Get only unique main commands.
     * Used by menu/help systems.
     */
    getCommands() {

        const commands = new Map();


        for (const plugin of this.plugins.values()) {

            if (!commands.has(plugin.name)) {

                commands.set(
                    plugin.name,
                    plugin
                );

            }

        }


        return commands;

    }


    /**
     * Get a plugin by name.
     */
    get(name) {
        return this.plugins.get(name);
    }


    /**
     * Check if plugin exists.
     */
    has(name) {
        return this.plugins.has(name);
    }


    /**
     * Number of loaded plugins.
     */
    size() {
        return this.plugins.size;
    }


    /**
     * Return plugins as array.
     */
    values() {
        return [...this.plugins.values()];
    }

}


export default new PluginStore();