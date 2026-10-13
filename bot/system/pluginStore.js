/**
 * JLEY-XMD Plugin Store
 * ---------------------
 * Central registry for all loaded plugins.
 * Supports plugin aliases and numbered Anti-Delete commands.
 */

class PluginStore {
    constructor() {
        this.plugins = new Map();
        this.aliases = new Map();
    }

    /**
     * Replace all loaded plugins and rebuild aliases.
     */
    set(plugins) {
        this.plugins = new Map(plugins);
        this.aliases = new Map();

        for (const [name, command] of this.plugins) {
            for (const alias of command.aliases || []) {
                const aliasName = String(alias).toLowerCase().trim();

                if (!aliasName || aliasName === name) continue;

                // Never let an alias override a real command.
                if (this.plugins.has(aliasName)) {
                    console.warn(
                        `[PluginStore] Alias "${aliasName}" conflicts with a plugin name.`
                    );
                    continue;
                }

                if (this.aliases.has(aliasName)) {
                    console.warn(
                        `[PluginStore] Duplicate alias "${aliasName}" ignored.`
                    );
                    continue;
                }

                this.aliases.set(aliasName, command);
            }
        }
    }

    /**
     * Get all registered plugins.
     */
    getAll() {
        return this.plugins;
    }

    /**
     * Get a plugin by name or alias.
     */
    get(name) {
        const commandName = String(name || "").toLowerCase();

        // Exact command name first.
        const exact = this.plugins.get(commandName);
        if (exact) return exact;

        // Existing numbered Anti-Delete support.
        if (/^antidelete\d+$/.test(commandName)) {
            return this.plugins.get("antidelete");
        }

        // Registered aliases, such as chatbot -> nexa.
        return this.aliases.get(commandName);
    }

    /**
     * Check whether a plugin or alias exists.
     */
    has(name) {
        const commandName = String(name || "").toLowerCase();

        return (
            this.plugins.has(commandName) ||
            /^antidelete\d+$/.test(commandName) &&
                this.plugins.has("antidelete") ||
            this.aliases.has(commandName)
        );
    }

    /**
     * Number of registered plugins.
     */
    size() {
        return this.plugins.size;
    }

    /**
     * Return registered plugins as an array.
     */
    values() {
        return [...this.plugins.values()];
    }
}

export default new PluginStore();