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
        this.plugins = plugins;
    }

    /**
     * Get all plugins.
     */
    getAll() {
        return this.plugins;
    }

    /**
     * Get a plugin by name.
     */
    get(name) {

    const commandName =
        String(name || "")
            .toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Exact command
    |--------------------------------------------------------------------------
    */

    const exact =
        this.plugins.get(
            commandName
        );

    if (exact) {
        return exact;
    }


    /*
    |--------------------------------------------------------------------------
    | Numbered Anti-Delete
    |--------------------------------------------------------------------------
    |
    | .antidelete1
    | .antidelete2
    | .antidelete3
    |
    | All are routed to the main antidelete plugin.
    |
    */

    if (
        /^antidelete\d+$/.test(
            commandName
        )
    ) {

        return this.plugins.get(
            "antidelete"
        );

    }


    return undefined;

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