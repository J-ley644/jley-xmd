import fs from "fs";
import path from "path";

const DATABASE =
    path.join(
        process.cwd(),
        "bot",
        "database"
    );

const CONFIG =
    path.join(
        DATABASE,
        "menuConfig.json"
    );

const BANNER =
    path.join(
        DATABASE,
        "menu-banner.jpg"
    );



function ensure() {

    if (!fs.existsSync(DATABASE)) {

        fs.mkdirSync(
            DATABASE,
            {
                recursive: true
            }
        );

    }

    if (!fs.existsSync(CONFIG)) {

        fs.writeFileSync(

            CONFIG,

            JSON.stringify({

                announcementEnabled: false,

                announcement: "",

                updatedBy: "System",

                updatedAt: null

            }, null, 4)

        );

    }

}



function load() {

    ensure();

    return JSON.parse(

        fs.readFileSync(
            CONFIG,
            "utf8"
        )

    );

}



function save(data) {

    ensure();

    fs.writeFileSync(

        CONFIG,

        JSON.stringify(
            data,
            null,
            4
        )

    );

}



function getAnnouncement() {

    return load();

}



function setAnnouncement(text, by = "Owner") {

    const data = load();

    data.announcementEnabled = true;

    data.announcement = text;

    data.updatedBy = by;

    data.updatedAt =
        new Date().toISOString();

    save(data);

}



function clearAnnouncement() {

    const data = load();

    data.announcementEnabled = false;

    data.announcement = "";

    data.updatedBy = "Owner";

    data.updatedAt =
        new Date().toISOString();

    save(data);

}



function bannerPath() {

    ensure();

    return BANNER;

}



function hasBanner() {

    return fs.existsSync(
        BANNER
    );

}



export default {

    getAnnouncement,

    setAnnouncement,

    clearAnnouncement,

    bannerPath,

    hasBanner

};