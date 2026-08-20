import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


/*
|--------------------------------------------------------------------------
| Paths
|--------------------------------------------------------------------------
*/

const __filename =
    fileURLToPath(import.meta.url);

const __dirname =
    path.dirname(__filename);


const DATABASE_DIR =
    path.join(
        __dirname,
        "..",
        "database"
    );


const DB_PATH =
    path.join(
        DATABASE_DIR,
        "automationSettings.json"
    );


/*
|--------------------------------------------------------------------------
| Default Settings
|--------------------------------------------------------------------------
*/

const DEFAULT_SETTINGS = {

    autoview: false,

    autoread: false,

    autolike: false,

    autoreply: false,

    autolikeEmoji: "❤️",

    autoreplyText:
        "Hello! I'm currently unavailable. I'll respond as soon as possible."

};


/*
|--------------------------------------------------------------------------
| Load Database
|--------------------------------------------------------------------------
*/

function load() {

    /*
    |--------------------------------------------------------------------------
    | Ensure Database Directory Exists
    |--------------------------------------------------------------------------
    */

    if (
        !fs.existsSync(
            DATABASE_DIR
        )
    ) {

        fs.mkdirSync(
            DATABASE_DIR,
            {
                recursive: true
            }
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Ensure Database File Exists
    |--------------------------------------------------------------------------
    */

    if (
        !fs.existsSync(
            DB_PATH
        )
    ) {

        fs.writeFileSync(
            DB_PATH,
            JSON.stringify(
                {},
                null,
                4
            ),
            "utf8"
        );

    }


    /*
    |--------------------------------------------------------------------------
    | Read Database
    |--------------------------------------------------------------------------
    */

    const content =
        fs.readFileSync(
            DB_PATH,
            "utf8"
        ).trim();


    if (!content) {

        return {};

    }


    /*
    |--------------------------------------------------------------------------
    | Parse Database
    |--------------------------------------------------------------------------
    */

    try {

        return JSON.parse(
            content
        );

    } catch {

        return {};

    }

}


/*
|--------------------------------------------------------------------------
| Save Database
|--------------------------------------------------------------------------
*/

function save(data) {

    /*
    |--------------------------------------------------------------------------
    | Ensure Directory Still Exists
    |--------------------------------------------------------------------------
    */

    if (
        !fs.existsSync(
            DATABASE_DIR
        )
    ) {

        fs.mkdirSync(
            DATABASE_DIR,
            {
                recursive: true
            }
        );

    }


    fs.writeFileSync(

        DB_PATH,

        JSON.stringify(
            data,
            null,
            4
        ),

        "utf8"

    );

}


/*
|--------------------------------------------------------------------------
| Get Settings
|--------------------------------------------------------------------------
*/

function get(user) {

    const db =
        load();


    if (!db[user]) {

        db[user] = {

            ...DEFAULT_SETTINGS

        };

        save(db);

    }


    return db[user];

}


/*
|--------------------------------------------------------------------------
| Set Single Setting
|--------------------------------------------------------------------------
*/

function set(
    user,
    key,
    value
) {

    const db =
        load();


    if (!db[user]) {

        db[user] = {

            ...DEFAULT_SETTINGS

        };

    }


    db[user][key] =
        value;


    save(db);


    return db[user];

}


/*
|--------------------------------------------------------------------------
| Get Single Setting
|--------------------------------------------------------------------------
*/

function getValue(
    user,
    key
) {

    const settings =
        get(user);


    return settings[key];

}


/*
|--------------------------------------------------------------------------
| Update Multiple Settings
|--------------------------------------------------------------------------
*/

function update(
    user,
    settings
) {

    const db =
        load();


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


/*
|--------------------------------------------------------------------------
| Export
|--------------------------------------------------------------------------
*/

export default {

    get,

    set,

    getValue,

    update

};