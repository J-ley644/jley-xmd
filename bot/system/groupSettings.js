import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


/*
 * groupSettings.js lives in:
 *
 * bot/system/groupSettings.js
 *
 * The database lives in:
 *
 * bot/database/groupSettings.json
 *
 * Therefore we go one directory up from
 * system/ and then into database/.
 *
 * This does NOT depend on process.cwd(),
 * so it works correctly on Render and locally.
 */

const DB_PATH =
    path.join(
        __dirname,
        "..",
        "database",
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
        fs.readFileSync(
            DB_PATH,
            "utf8"
        ).trim();


    if (!content) {

        return {};

    }


    try {

        return JSON.parse(content);

    } catch (error) {

        console.error(
            "[GROUP SETTINGS] Failed to parse database:",
            error
        );

        return {};

    }

}


function save(data) {

    fs.writeFileSync(

        DB_PATH,

        JSON.stringify(
            data,
            null,
            4
        )

    );

}


function get(group) {

    const db =
        load();


    if (!db[group]) {

        db[group] = {

            ...DEFAULT_SETTINGS

        };

        save(db);

    }


    return db[group];

}


function set(
    group,
    key,
    value
) {

    const db =
        load();


    if (!db[group]) {

        db[group] = {

            ...DEFAULT_SETTINGS

        };

    }


    db[group][key] =
        value;


    save(db);


    return db[group];

}


function getValue(
    group,
    key
) {

    const settings =
        get(group);

    return settings[key];

}


export default {

    get,

    set,

    getValue

};