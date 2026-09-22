import fs from "fs";
import path from "path";

import { useMultiFileAuthState } from "@whiskeysockets/baileys";

import prisma from "../../config/prisma.js";
import { SESSIONS_ROOT } from "./constants.js";

/*

* Prevent multiple session synchronizations for
* the same deployment from running simultaneously.
  */

const syncLocks = new Map();

/*

* Debounce timers.
  */

const syncTimers = new Map();

const SYNC_DELAY = 3000;

if (!fs.existsSync(SESSIONS_ROOT)) {


fs.mkdirSync(
    SESSIONS_ROOT,
    {
        recursive: true
    }
);


}

/*

* Get local session folder.
  */

export function getSessionPath(deploymentId) {


return path.join(
    SESSIONS_ROOT,
    String(deploymentId)
);


}

/*

* Restore authentication files from PostgreSQL.
*
* The database remains the source of truth when a deployment
* starts on a new Render instance.
  */

async function restoreSessionFiles(deploymentId) {


const key =
    String(deploymentId);


const sessionPath =
    getSessionPath(key);


fs.mkdirSync(
    sessionPath,
    {
        recursive: true
    }
);


const files =
    await prisma.whatsAppSession.findMany({

        where: {

            deploymentId:
                key

        }

    });


if (!files.length) {

    console.log(
        `[SESSION RESTORE] No stored session files for deployment ${key}`
    );

    return 0;

}


let restored = 0;


for (const file of files) {

    const fileName =
        file.fileName;


    /*
     * Never allow path traversal.
     */

    if (
        typeof fileName !== "string" ||
        !fileName ||
        fileName.includes("..") ||
        path.isAbsolute(fileName)
    ) {

        console.warn(
            `[SESSION RESTORE] Skipping unsafe file: ${fileName}`
        );

        continue;

    }


    const filePath =
        path.join(
            sessionPath,
            fileName
        );


    try {

        fs.writeFileSync(
            filePath,
            file.data,
            "utf8"
        );


        restored++;

    } catch (error) {

        console.error(
            `[SESSION RESTORE] Failed restoring ${fileName} for ${key}:`,
            error.message
        );

    }

}


console.log(
    `[SESSION RESTORE] Deployment ${key}: restored ${restored}/${files.length} session files`
);


return restored;


}

/*

* Persist authentication files.
  */

async function persistSessionFiles(deploymentId) {


const key =
    String(deploymentId);


if (syncLocks.has(key)) {

    return syncLocks.get(key);

}


const syncPromise =
    (async () => {

        const sessionPath =
            getSessionPath(key);


        if (
            !fs.existsSync(sessionPath)
        ) {

            return;

        }


        let files;


        try {

            files =
                fs.readdirSync(
                    sessionPath
                );

        } catch (error) {

            if (
                error.code === "ENOENT"
            ) {

                return;

            }


            throw error;

        }


        let saved = 0;


        for (
            const fileName of files
        ) {

            /*
             * Never allow path traversal.
             */

            if (
                typeof fileName !== "string" ||
                !fileName ||
                fileName.includes("..") ||
                path.isAbsolute(fileName)
            ) {

                continue;

            }


            const filePath =
                path.join(
                    sessionPath,
                    fileName
                );


            try {

                /*
                 * Baileys can replace/delete files while
                 * we are reading the directory.
                 */

                if (
                    !fs.existsSync(filePath)
                ) {

                    continue;

                }


                const stats =
                    fs.statSync(
                        filePath
                    );


                if (
                    !stats.isFile()
                ) {

                    continue;

                }


                const data =
                    fs.readFileSync(
                        filePath,
                        "utf8"
                    );


                await prisma.whatsAppSession.upsert({

                    where: {

                        deploymentId_fileName: {

                            deploymentId:
                                key,

                            fileName

                        }

                    },

                    update: {

                        data

                    },

                    create: {

                        deploymentId:
                            key,

                        fileName,

                        data

                    }

                });


                saved++;

            } catch (error) {

                /*
                 * File may have disappeared because
                 * Baileys rotated an authentication file.
                 */

                if (
                    error.code === "ENOENT"
                ) {

                    continue;

                }


                console.error(
                    `Session file sync failed (${fileName}):`,
                    error.message
                );

            }

        }


        console.log(
            `[SESSION SYNC] Deployment ${key}: synced ${saved} session files`
        );

    })();


syncLocks.set(
    key,
    syncPromise
);


try {

    await syncPromise;

} finally {

    syncLocks.delete(key);

}


}

/*

* Schedule database synchronization.
  */

function scheduleSessionSync(deploymentId) {


const key =
    String(deploymentId);


const existingTimer =
    syncTimers.get(key);


if (existingTimer) {

    clearTimeout(
        existingTimer
    );

}


const timer =
    setTimeout(
        async () => {

            syncTimers.delete(
                key
            );


            try {

                await persistSessionFiles(
                    key
                );

            } catch (error) {

                console.error(
                    `[SESSION SYNC] Persistence error for ${key}:`,
                    error.message
                );

            }

        },

        SYNC_DELAY
    );


syncTimers.set(
    key,
    timer
);


}

/*

* Load Baileys authentication state.
  */

export async function getAuthState(deploymentId) {


const key =
    String(deploymentId);


/*
 * Restore persisted credentials BEFORE
 * useMultiFileAuthState() reads the folder.
 */

const restored =
    await restoreSessionFiles(
        key
    );


const sessionPath =
    getSessionPath(key);


console.log(
    `[SESSION AUTH] Deployment ${key}: restored ${restored} files`
);


const {

    state,

    saveCreds:
        originalSaveCreds

} =
    await useMultiFileAuthState(
        sessionPath
    );


/*
 * Save locally immediately, then synchronize
 * the complete authentication state to PostgreSQL.
 */

const saveCreds =
    async () => {

        await originalSaveCreds();


        scheduleSessionSync(
            key
        );

    };


/*
 * Final synchronization during shutdown.
 */

const stopSync =
    async () => {

        const timer =
            syncTimers.get(key);


        if (timer) {

            clearTimeout(
                timer
            );

            syncTimers.delete(
                key
            );

        }


        try {

            await persistSessionFiles(
                key
            );

        } catch (error) {

            console.error(
                `[SESSION SYNC] Final synchronization failed for ${key}:`,
                error.message
            );

        }

    };


return {

    state,

    saveCreds,

    stopSync

};


}

/*

* Delete only the local authentication folder.
*
* IMPORTANT:
* This does NOT delete the persisted PostgreSQL session.
  */

export function deleteSessionFolder(deploymentId) {


const key =
    String(deploymentId);


const timer =
    syncTimers.get(key);


if (timer) {

    clearTimeout(
        timer
    );

    syncTimers.delete(
        key
    );

}


const sessionPath =
    getSessionPath(key);


if (
    fs.existsSync(sessionPath)
) {

    fs.rmSync(
        sessionPath,

        {

            recursive: true,

            force: true

        }

    );

}


}
