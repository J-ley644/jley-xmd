import fs from "fs";
import path from "path";
import prisma from "../../api/src/config/prisma.js";

const DATABASE = path.join(
process.cwd(),
"bot",
"database"
);

const CONFIG = path.join(
DATABASE,
"menuConfig.json"
);

const BANNER_KEY = "jley_menu_banner";

/*

* In-memory caches.
*
* This prevents .menu from reading the disk and
* querying Supabase every single time a user
* requests the menu.
  */

let announcementCache = null;

let bannerCache = undefined;

let bannerLoading = null;

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
        JSON.stringify(
            {
                announcementEnabled: false,
                announcement: "",
                updatedBy: "System",
                updatedAt: null
            },
            null,
            4
        )
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

/*

* ANNOUNCEMENT
  */

function getAnnouncement() {


if (announcementCache) {

    return announcementCache;

}


announcementCache =
    load();


return announcementCache;


}

function setAnnouncement(
text,
by = "Owner"
) {


const data =
    getAnnouncement();


data.announcementEnabled =
    true;

data.announcement =
    text;

data.updatedBy =
    by;

data.updatedAt =
    new Date().toISOString();


announcementCache =
    data;


save(data);


}

function clearAnnouncement() {


const data =
    getAnnouncement();


data.announcementEnabled =
    false;

data.announcement =
    "";

data.updatedBy =
    "Owner";

data.updatedAt =
    new Date().toISOString();


announcementCache =
    data;


save(data);


}

/*

* BANNER
  */

async function setBanner(
buffer
) {


const base64 =
    buffer.toString(
        "base64"
    );


await prisma.systemSetting.upsert({

    where: {

        key:
            BANNER_KEY

    },

    update: {

        value:
            base64

    },

    create: {

        key:
            BANNER_KEY,

        value:
            base64

    }

});


/*
 * Immediately update the cache.
 */

bannerCache =
    buffer;


}

async function getBanner() {


/*
 * undefined means the banner has not
 * been loaded yet.
 *
 * null means there is no banner.
 */

if (
    bannerCache !== undefined
) {

    return bannerCache;

}


/*
 * Prevent multiple simultaneous
 * .menu commands from creating multiple
 * database queries.
 */

if (bannerLoading) {

    return bannerLoading;

}


bannerLoading =
    (async () => {

        try {

            const setting =
                await prisma.systemSetting.findUnique({

                    where: {

                        key:
                            BANNER_KEY

                    }

                });


            if (
                !setting?.value
            ) {

                bannerCache =
                    null;

                return null;

            }


            bannerCache =
                Buffer.from(
                    setting.value,
                    "base64"
                );


            return bannerCache;

        } finally {

            bannerLoading =
                null;

        }

    })();


return bannerLoading;


}

async function hasBanner() {


const banner =
    await getBanner();


return !!banner;


}

export default {


getAnnouncement,

setAnnouncement,

clearAnnouncement,

setBanner,

getBanner,

hasBanner


};
