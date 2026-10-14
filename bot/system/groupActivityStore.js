
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_DIR = path.join(__dirname, "..", "database");
const DB_PATH = path.join(DATABASE_DIR, "groupActivity.json");

function ensureDatabase() {
    fs.mkdirSync(DATABASE_DIR, { recursive: true });

    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, "{}", "utf8");
    }
}

function load() {
    ensureDatabase();

    try {
        const content = fs.readFileSync(DB_PATH, "utf8").trim();
        if (!content) return {};

        const data = JSON.parse(content);

        return data && typeof data === "object" && !Array.isArray(data)
            ? data
            : {};
    } catch (error) {
        console.error("[GROUP ACTIVITY] Failed to load database:", error.message);
        return {};
    }
}

function save(data) {
    ensureDatabase();

    const temporaryPath = `${DB_PATH}.tmp`;

    fs.writeFileSync(temporaryPath, JSON.stringify(data, null, 2), "utf8");
    fs.renameSync(temporaryPath, DB_PATH);
}

function recordMessage(deploymentId, groupId, memberId, pushName, timestamp = Date.now()) {
    if (!deploymentId || !groupId?.endsWith("@g.us") || !memberId) {
        return;
    }

    // Ignore the bot's own messages.
    const db = load();

    db[deploymentId] ??= {};
    db[deploymentId][groupId] ??= {};

    const previous = db[deploymentId][groupId][memberId] || {
        count: 0,
        firstSeen: timestamp
    };

    db[deploymentId][groupId][memberId] = {
        count: previous.count + 1,
        firstSeen: previous.firstSeen,
        lastMessage: timestamp,
        pushName: pushName || previous.pushName || "Unknown"
    };

    save(db);
}

function getGroupActivity(deploymentId, groupId) {
    const db = load();

    return db?.[deploymentId]?.[groupId] || {};
}

export default {
    recordMessage,
    getGroupActivity
};
