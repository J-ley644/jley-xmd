import fs from "fs";
import path from "path";

const DB_PATH = path.join(
    process.cwd(),
    "bot",
    "database",
    "warnings.json"
);

function load() {

    if (!fs.existsSync(DB_PATH)) {

        fs.writeFileSync(
            DB_PATH,
            JSON.stringify({}, null, 4)
        );

    }

    const content =
        fs.readFileSync(DB_PATH, "utf8").trim();

    if (!content) {

        fs.writeFileSync(
            DB_PATH,
            JSON.stringify({}, null, 4)
        );

        return {};

    }

    try {

        return JSON.parse(content);

    } catch (error) {

        fs.writeFileSync(
            DB_PATH,
            JSON.stringify({}, null, 4)
        );

        return {};

    }

}

function save(data) {

    fs.writeFileSync(
        DB_PATH,
        JSON.stringify(data, null, 4)
    );

}

function getUser(group, user) {

    const db = load();

    if (!db[group]) {
        db[group] = {};
    }

    if (!db[group][user]) {

        db[group][user] = {

            count: 0,

            history: []

        };

    }

    save(db);

    return db[group][user];

}

function warn(group, user, by, reason) {

    const db = load();

    if (!db[group]) {
        db[group] = {};
    }

    if (!db[group][user]) {

        db[group][user] = {

            count: 0,

            history: []

        };

    }

    db[group][user].count++;

    db[group][user].history.push({

        reason,

        by,

        time: new Date().toISOString()

    });

    save(db);

    return db[group][user];

}

function clear(group, user) {

    const db = load();

    if (db[group]) {

        delete db[group][user];

        save(db);

    }

}

export default {

    getUser,

    warn,

    clear

};