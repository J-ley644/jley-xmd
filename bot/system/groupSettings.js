import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(
    __dirname,
    "groupSettings.json"
);


const DEFAULT_SETTINGS = {

    welcome: false,

    goodbye: false,

    antilink: false

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




function get(group) {

    const db = load();


    if (!db[group]) {

        db[group] = {
            ...DEFAULT_SETTINGS
        };

        save(db);

    }


    return db[group];

}




function set(group, key, value) {

    const db = load();


    if (!db[group]) {

        db[group] = {
            ...DEFAULT_SETTINGS
        };

    }


    db[group][key] = value;


    save(db);


    return db[group];

}




function getValue(group, key) {

    const settings = get(group);

    return settings[key];

}



export default {

    get,

    set,

    getValue

};