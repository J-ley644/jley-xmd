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

function ensure() {

    if (!fs.existsSync(DATABASE)) {

        fs.mkdirSync(
            DATABASE,
            { recursive: true }
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

function setAnnouncement(
    text,
    by = "Owner"
) {

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

async function setBanner(buffer) {

    const base64 =
        buffer.toString("base64");

    await prisma.systemSetting.upsert({

        where: {
            key: BANNER_KEY
        },

        update: {
            value: base64
        },

        create: {
            key: BANNER_KEY,
            value: base64
        }

    });

}

async function getBanner() {

    const setting =
        await prisma.systemSetting.findUnique({

            where: {
                key: BANNER_KEY
            }

        });

    if (!setting?.value) {

        return null;

    }

    return Buffer.from(
        setting.value,
        "base64"
    );

}

async function hasBanner() {

    const setting =
        await prisma.systemSetting.findUnique({

            where: {
                key: BANNER_KEY
            }

        });

    return !!setting?.value;

}

export default {

    getAnnouncement,

    setAnnouncement,

    clearAnnouncement,

    setBanner,

    getBanner,

    hasBanner

};