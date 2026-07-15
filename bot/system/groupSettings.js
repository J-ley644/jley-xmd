import fs from "fs";
import path from "path";

const DB_PATH = path.join(
    process.cwd(),
    "bot",
    "database",
    "groupSettings.json"
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

    } catch {

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

function get(group) {

    const db = load();

    if (!db[group]) {

        db[group] = {

            welcome: false,
            goodbye: false

        };

        save(db);

    }

    return db[group];

}

function set(group, key, value) {

    const db = load();

    if (!db[group]) {

        db[group] = {

            welcome: false,
            goodbye: false

        };

    }

    db[group][key] = value;

    save(db);

    return db[group];

}

export default {

    get,
    set

};