import fs from "fs";
import path from "path";

const DB_PATH = path.join(
    process.cwd(),
    "bot",
    "database",
    "automationSettings.json"
);


const DEFAULT_SETTINGS = {

    autoview: false,

    autoread: false,

    autolike: false,

    autoreply: false,

    autolikeEmoji: "❤️",

    autoreplyText:
        "Hello! I'm currently unavailable. I'll respond as soon as possible."

};




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

        return {};

    }


    try {

        return JSON.parse(content);

    } catch {

        return {};

    }

}




function save(data) {

    fs.writeFileSync(

        DB_PATH,

        JSON.stringify(data, null, 4)

    );

}




function get(user) {

    const db = load();


    if (!db[user]) {

        db[user] = {
            ...DEFAULT_SETTINGS
        };

        save(db);

    }


    return db[user];

}




function set(user, key, value) {

    const db = load();


    if (!db[user]) {

        db[user] = {
            ...DEFAULT_SETTINGS
        };

    }


    db[user][key] = value;


    save(db);


    return db[user];

}




function getValue(user, key) {

    const settings =
        get(user);

    return settings[key];

}

function update(user, settings) {

    const db = load();

    if (!db[user]) {

        db[user] = {
            ...DEFAULT_SETTINGS
        };

    }

    db[user] = {

        ...db[user],

        ...settings

    };

    save(db);

    return db[user];

}

export default {

    get,

    set,

    getValue,

    update

};