
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "bot", "database");
const DB_PATH = path.join(DB_DIR, "nexaSettings.json");

const MAX_HISTORY_MESSAGES = 12;

function ensureDatabase() {
    fs.mkdirSync(DB_DIR, { recursive: true });

    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(
            DB_PATH,
            JSON.stringify({}, null, 2),
            "utf8"
        );
    }
}

function loadDatabase() {
    ensureDatabase();

    try {
        const content = fs.readFileSync(DB_PATH, "utf8");
        return content.trim() ? JSON.parse(content) : {};
    } catch (error) {
        console.error("[NEXA] Could not read settings:", error.message);
        return {};
    }
}

function saveDatabase(database) {
    ensureDatabase();

    const temporaryPath = `${DB_PATH}.tmp`;

    fs.writeFileSync(
        temporaryPath,
        JSON.stringify(database, null, 2),
        "utf8"
    );

    fs.renameSync(temporaryPath, DB_PATH);
}

function getDeployment(database, deploymentId) {
    const id = String(deploymentId || "main");

    if (!database[id]) {
        database[id] = {
            globalEnabled: false,
            chats: {}
        };
    }

    if (!database[id].chats) {
        database[id].chats = {};
    }

    return database[id];
}

function getChat(deployment, chatId) {
    if (!deployment.chats[chatId]) {
        deployment.chats[chatId] = {
            override: null,
            history: []
        };
    }

    return deployment.chats[chatId];
}

function getSettings(deploymentId, chatId) {
    const database = loadDatabase();
    const deployment = getDeployment(database, deploymentId);
    const chat = getChat(deployment, chatId);

    return {
        globalEnabled: deployment.globalEnabled,
        chatOverride: chat.override,
        enabled: chat.override === null
            ? deployment.globalEnabled
            : chat.override
    };
}

function setGlobal(deploymentId, enabled) {
    const database = loadDatabase();
    const deployment = getDeployment(database, deploymentId);

    deployment.globalEnabled = Boolean(enabled);
    saveDatabase(database);

    return deployment.globalEnabled;
}

function setChat(deploymentId, chatId, enabled) {
    const database = loadDatabase();
    const deployment = getDeployment(database, deploymentId);
    const chat = getChat(deployment, chatId);

    chat.override = Boolean(enabled);
    saveDatabase(database);

    return chat.override;
}

function clearChatOverride(deploymentId, chatId) {
    const database = loadDatabase();
    const deployment = getDeployment(database, deploymentId);
    const chat = getChat(deployment, chatId);

    chat.override = null;
    saveDatabase(database);
}

function getHistory(deploymentId, chatId) {
    const database = loadDatabase();
    const deployment = getDeployment(database, deploymentId);
    const chat = getChat(deployment, chatId);

    return [...chat.history];
}

function addExchange(deploymentId, chatId, userText, assistantText) {
    const database = loadDatabase();
    const deployment = getDeployment(database, deploymentId);
    const chat = getChat(deployment, chatId);

    chat.history.push(
        { role: "user", text: userText },
        { role: "model", text: assistantText }
    );

    chat.history = chat.history.slice(-MAX_HISTORY_MESSAGES);

    saveDatabase(database);
}

function resetHistory(deploymentId, chatId) {
    const database = loadDatabase();
    const deployment = getDeployment(database, deploymentId);
    const chat = getChat(deployment, chatId);

    chat.history = [];
    saveDatabase(database);
}

export default {
    getSettings,
    setGlobal,
    setChat,
    clearChatOverride,
    getHistory,
    addExchange,
    resetHistory
};
