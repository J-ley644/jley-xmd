import fs from "fs";
import path from "path";

const DB_PATH = path.join(
    process.cwd(),
    "bot",
    "database",
    "autoMention.json"
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

    return db[group] || [];

}




function isEnabled(group, user) {

    return get(group).includes(user);

}




function enable(group, user) {

    const db = load();

    if (!db[group]) {

        db[group] = [];

    }

    if (!db[group].includes(user)) {

        db[group].push(user);

    }

    save(db);

}




function disable(group, user) {

    const db = load();

    if (!db[group]) {

        return;

    }

    db[group] = db[group].filter(

        id => id !== user

    );

    save(db);

}




export default {

    get,

    enable,

    disable,

    isEnabled

};