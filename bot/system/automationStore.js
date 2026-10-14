import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_DIR = path.join(
    __dirname,
    "..",
    "database"
);

const DB_PATH = path.join(
    DATABASE_DIR,
    "automationSettings.json"
);

const DEFAULT_SETTINGS = {
    prefix: ".",
    mode: "public",
    autoview: false,
    autoread: false,
    autolike: false,
    autoreply: false,
    automention: false,
    autotyping: false,
    autorecording: false,
    autolikeEmoji: "❤️",
    autoreplyText:
        "Hello! I'm currently unavailable. I'll respond as soon as possible.",
    anticall: false,
    anticallMode: "off",
    anticallReply:
        "Sorry, I don't take WhatsApp calls. Please send me a message instead."
};

function createBotSettings() {
    return {
        ...DEFAULT_SETTINGS,
        chats: {}
    };
}

function ensureDatabase() {
    fs.mkdirSync(DATABASE_DIR, {
        recursive: true
    });

    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(
            DB_PATH,
            JSON.stringify({}, null, 4),
            "utf8"
        );
    }
}

function load() {
    ensureDatabase();

    try {
        const content = fs.readFileSync(
            DB_PATH,
            "utf8"
        ).trim();

        if (!content) return {};

        const data = JSON.parse(content);

        if (
            !data ||
            typeof data !== "object" ||
            Array.isArray(data)
        ) {
            console.error(
                "[AUTOMATION STORE] Invalid database format."
            );
            return {};
        }

        return data;
    } catch (error) {
        console.error(
            "[AUTOMATION STORE] Failed to load settings:",
            error?.message || error
        );

        return {};
    }
}

function save(data) {
    ensureDatabase();

    const temporaryPath = `${DB_PATH}.tmp`;

    fs.writeFileSync(
        temporaryPath,
        JSON.stringify(data, null, 4),
        "utf8"
    );

    fs.renameSync(temporaryPath, DB_PATH);
}

function normalizeSettings(settings) {
    const current =
        settings &&
        typeof settings === "object" &&
        !Array.isArray(settings)
            ? settings
            : {};

    return {
        ...DEFAULT_SETTINGS,
        ...current,
        chats:
            current.chats &&
            typeof current.chats === "object" &&
            !Array.isArray(current.chats)
                ? current.chats
                : {}
    };
}

/*
 * Every deployment must use its deploymentId as the key.
 */
function get(deploymentId) {
    if (
        typeof deploymentId !== "string" ||
        !deploymentId.trim()
    ) {
        throw new Error(
            "A valid deploymentId is required for automation settings."
        );
    }

    const db = load();
    const previous = db[deploymentId];
    const normalized = normalizeSettings(previous);

    if (
        !previous ||
        JSON.stringify(previous) !== JSON.stringify(normalized)
    ) {
        db[deploymentId] = normalized;
        save(db);
    }

    return db[deploymentId];
}

function set(deploymentId, key, value) {
    if (
        typeof deploymentId !== "string" ||
        !deploymentId.trim()
    ) {
        throw new Error(
            "A valid deploymentId is required for automation settings."
        );
    }

    if (
        typeof key !== "string" ||
        !key.trim() ||
        key === "chats"
    ) {
        throw new Error(
            "A valid global setting key is required."
        );
    }

    const db = load();

    db[deploymentId] = normalizeSettings(
        db[deploymentId]
    );

    db[deploymentId][key] = value;

    save(db);

    return db[deploymentId];
}

function getValue(deploymentId, key) {
    return get(deploymentId)[key];
}

function getChat(deploymentId, chat) {
    const settings = get(deploymentId);

    if (!settings.chats[chat]) {
        settings.chats[chat] = {};
        const db = load();
        db[deploymentId] = settings;
        save(db);
    }

    return {
        ...DEFAULT_SETTINGS,
        ...settings.chats[chat]
    };
}

function setChat(deploymentId, chat, key, value) {
    if (
        typeof deploymentId !== "string" ||
        !deploymentId.trim()
    ) {
        throw new Error(
            "A valid deploymentId is required for chat settings."
        );
    }

    const db = load();

    db[deploymentId] = normalizeSettings(
        db[deploymentId]
    );

    if (!db[deploymentId].chats[chat]) {
        db[deploymentId].chats[chat] = {};
    }

    db[deploymentId].chats[chat][key] = value;

    save(db);

    return {
        ...DEFAULT_SETTINGS,
        ...db[deploymentId].chats[chat]
    };
}

function update(deploymentId, settings) {
    if (
        typeof deploymentId !== "string" ||
        !deploymentId.trim()
    ) {
        throw new Error(
            "A valid deploymentId is required for automation settings."
        );
    }

    const db = load();

    const current = normalizeSettings(
        db[deploymentId]
    );

    const updates = {
        ...(settings || {})
    };

    // Chat settings are managed separately.
    delete updates.chats;

    db[deploymentId] = {
        ...current,
        ...updates,
        chats: current.chats
    };

    save(db);

    return db[deploymentId];
}

function updateChat(deploymentId, chat, settings) {
    if (
        typeof deploymentId !== "string" ||
        !deploymentId.trim()
    ) {
        throw new Error(
            "A valid deploymentId is required for chat settings."
        );
    }

    const db = load();

    db[deploymentId] = normalizeSettings(
        db[deploymentId]
    );

    const previous =
        db[deploymentId].chats[chat] || {};

    db[deploymentId].chats[chat] = {
        ...previous,
        ...(settings || {})
    };

    save(db);

    return {
        ...DEFAULT_SETTINGS,
        ...db[deploymentId].chats[chat]
    };
}

export default {
    get,
    set,
    getValue,
    getChat,
    setChat,
    update,
    updateChat
};