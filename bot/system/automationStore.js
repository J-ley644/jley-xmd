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

    automention: false,

    autotyping: false,

    autorecording: false,

    autolikeEmoji: "❤️",

    autoreplyText:
        "Hello! I'm currently unavailable. I'll respond as soon as possible."

};


/*
|--------------------------------------------------------------------------
| Ensure Database
|--------------------------------------------------------------------------
*/

function ensureDatabase() {

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

}


/*
|--------------------------------------------------------------------------
| Load Database
|--------------------------------------------------------------------------
*/

function load() {

    ensureDatabase();


    const content =
        fs.readFileSync(
            DB_PATH,
            "utf8"
        ).trim();


    if (!content) {

        return {};

    }


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

    ensureDatabase();


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
| Create Bot Settings
|--------------------------------------------------------------------------
*/

function createBotSettings() {

    return {

        ...DEFAULT_SETTINGS,

        chats: {}

    };

}


/*
|--------------------------------------------------------------------------
| Get Bot Settings
|--------------------------------------------------------------------------
*/

function get(user) {

    const db =
        load();


    if (!db[user]) {

    db[user] =
        createBotSettings();

    save(db);

} else {

    let changed = false;


    for (
        const [key, value]
        of Object.entries(DEFAULT_SETTINGS)
    ) {

        if (
            db[user][key] === undefined
        ) {

            db[user][key] =
                value;

            changed = true;

        }

    }


    if (
        !db[user].chats
    ) {

        db[user].chats = {};

        changed = true;

    }


    if (changed) {

        save(db);

    }

}


    /*
    |--------------------------------------------------------------------------
    | Migration Protection
    |--------------------------------------------------------------------------
    */

    if (
        !db[user].chats
    ) {

        db[user].chats = {};

        save(db);

    }


    return db[user];

}


/*
|--------------------------------------------------------------------------
| Set Global Setting
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

        db[user] =
            createBotSettings();

    }


    db[user][key] =
        value;


    save(db);


    return db[user];

}


/*
|--------------------------------------------------------------------------
| Get Global Setting
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
| Get Chat Settings
|--------------------------------------------------------------------------
*/

function getChat(
    user,
    chat
) {

    const settings =
        get(user);


    if (
        !settings.chats[chat]
    ) {

        settings.chats[chat] = {};

    }


    return {

        ...DEFAULT_SETTINGS,

        ...settings.chats[chat]

    };

}


/*
|--------------------------------------------------------------------------
| Set Chat Setting
|--------------------------------------------------------------------------
*/

function setChat(
    user,
    chat,
    key,
    value
) {

    const db =
        load();


    if (!db[user]) {

        db[user] =
            createBotSettings();

    }


    if (
        !db[user].chats
    ) {

        db[user].chats = {};

    }


    if (
        !db[user].chats[chat]
    ) {

        db[user].chats[chat] = {};

    }


    db[user].chats[chat][key] =
        value;


    save(db);


    return {

        ...DEFAULT_SETTINGS,

        ...db[user].chats[chat]

    };

}


/*
|--------------------------------------------------------------------------
| Update Multiple Global Settings
|--------------------------------------------------------------------------
*/

function update(
    user,
    settings
) {

    const db =
        load();


    if (!db[user]) {

        db[user] =
            createBotSettings();

    }


    db[user] = {

        ...db[user],

        ...settings,

        chats:
            db[user].chats || {}

    };


    save(db);


    return db[user];

}


/*
|--------------------------------------------------------------------------
| Update Multiple Chat Settings
|--------------------------------------------------------------------------
*/

function updateChat(
    user,
    chat,
    settings
) {

    const db =
        load();


    if (!db[user]) {

        db[user] =
            createBotSettings();

    }


    if (
        !db[user].chats
    ) {

        db[user].chats = {};

    }


    if (
        !db[user].chats[chat]
    ) {

        db[user].chats[chat] = {};

    }


    db[user].chats[chat] = {

        ...db[user].chats[chat],

        ...settings

    };


    save(db);


    return {

        ...DEFAULT_SETTINGS,

        ...db[user].chats[chat]

    };

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

    getChat,

    setChat,

    update,

    updateChat

};