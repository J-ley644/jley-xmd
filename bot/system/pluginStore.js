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