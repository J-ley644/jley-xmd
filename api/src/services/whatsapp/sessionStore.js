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

/*

* Make sure the root session directory exists.
  */

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

* Check whether a filename is safe to restore.
  */

function isSafeSessionFile(fileName) {


if (
    typeof fileName !== "string" ||
    !fileName.trim()
) {

    return false;

}


if (
    fileName.includes("..") ||
    path.isAbsolute(fileName)
) {

    return false;

}


return true;


}

/*

* Restore authentication files from PostgreSQL.
*
* IMPORTANT:
*
* We clear the local deployment folder first.
* This prevents stale files from a previous container
* from being mixed with the persisted database session.
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


let files;

try {

    files =
        await prisma.whatsAppSession.findMany({

            where: {

                deploymentId:
                    key

            }

        });

} catch (error) {

    console.error(
        `[SESSION RESTORE] Failed reading persisted session for ${key}:`,
        error.message
    );

    throw error;

}


/*
 * No persisted files means this is potentially
 * a brand-new deployment.
 *
 * Do NOT block normal QR pairing in this case.
 */

if (!files.length) {

    console.log(
        `[SESSION RESTORE] No persisted session found for ${key}. New pairing is allowed.`
    );

    return {

        found: false,

        restored: 0,

        hasCreds: false

    };

}


/*
 * Existing deployment has persisted session records.
 *
 * Remove the local copy before restoring the database
 * version so old/stale authentication files cannot
 * contaminate the restored state.
 */

try {

    fs.rmSync(
        sessionPath,
        {
            recursive: true,
            force: true
        }
    );

    fs.mkdirSync(
        sessionPath,
        {
            recursive: true
        }
    );

} catch (error) {

    console.error(
        `[SESSION RESTORE] Failed preparing session directory for ${key}:`,
        error.message
    );

    throw error;

}


let restored = 0;

let hasCreds = false;


for (const file of files) {

    const fileName =
        file.fileName;


    if (
        !isSafeSessionFile(fileName)
    ) {

        console.warn(
            `[SESSION RESTORE] Ignoring unsafe session filename for ${key}: ${fileName}`
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


        if (
            fileName === "creds.json"
        ) {

            hasCreds = true;

        }

    } catch (error) {

        console.error(
            `[SESSION RESTORE] Failed restoring ${fileName} for ${key}:`,
            error.message
        );

    }

}


/*
 * An existing persisted deployment MUST contain
 * creds.json.
 *
 * Without it, Baileys will create a fresh auth state
 * and eventually generate a QR code.
 *
 * We deliberately stop here instead of silently
 * converting an existing deployment into a new pairing.
 */

if (!hasCreds) {

    throw new Error(
        `[SESSION RESTORE] Persisted session for deployment ${key} is incomplete: creds.json is missing. Refusing to start a fresh WhatsApp pairing.`
    );

}


/*
 * Validate the restored creds.json.
 *
 * We only validate that it is valid JSON and has the
 * basic Baileys credential structure. We do not modify it.
 */

const credsPath =
    path.join(
        sessionPath,
        "creds.json"
    );


try {

    const credsRaw =
        fs.readFileSync(
            credsPath,
            "utf8"
        );


    const creds =
        JSON.parse(
            credsRaw
        );


    if (
        !creds ||
        typeof creds !== "object"
    ) {

        throw new Error(
            "creds.json is not a valid object"
        );

    }


    /*
     * Baileys credentials contain registrationId
     * and key material. We use these as a lightweight
     * sanity check without assuming every Baileys
     * version has exactly the same optional fields.
     */

    if (
        typeof creds.registrationId !== "number" &&
        typeof creds.registrationId !== "string"
    ) {

        throw new Error(
            "registrationId is missing"
        );

    }


    console.log(
        `[SESSION RESTORE] Valid persisted credentials found for ${key}.`
    );

} catch (error) {

    throw new Error(
        `[SESSION RESTORE] Persisted creds.json for deployment ${key} is invalid: ${error.message}`
    );

}


console.log(
    `[SESSION RESTORE] Restored ${restored} session files for ${key}.`
);


return {

    found: true,

    restored,

    hasCreds: true

};


}

/*

* Persist authentication files.
*
* Uses a lock so two credential updates cannot
* scan and write the same session folder at once.
  */

async function persistSessionFiles(deploymentId) {


const key =
    String(deploymentId);


/*
 * Wait for an existing synchronization.
 */

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
                !isSafeSessionFile(fileName)
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
                 * Baileys may delete or replace
                 * authentication files while we
                 * are scanning the folder.
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
                 * File disappeared while Baileys
                 * was rotating authentication keys.
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
            `Synced ${saved} session files for ${key}`
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

* Schedule database synchronization instead of
* immediately hitting Supabase on every creds.update.
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
                    "Session persistence error:",
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


const restoreResult =
    await restoreSessionFiles(
        key
    );


const sessionPath =
    getSessionPath(
        key
    );


/*
 * For an existing deployment, restoration must have
 * produced valid credentials.
 *
 * Brand-new deployments are still allowed to proceed
 * because restoreResult.found will be false.
 */

if (
    restoreResult.found &&
    !restoreResult.hasCreds
) {

    throw new Error(
        `[SESSION RESTORE] Deployment ${key} has persisted session data but no valid credentials.`
    );

}


const {

    state,

    saveCreds:
        originalSaveCreds

} =
    await useMultiFileAuthState(
        sessionPath
    );


const saveCreds =
    async () => {

        /*
         * Save immediately to the local disk
         * because Baileys needs the newest state.
         */

        await originalSaveCreds();


        /*
         * Database synchronization is delayed
         * and grouped together.
         */

        scheduleSessionSync(
            key
        );

    };


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


        /*
         * Perform one final synchronization
         * before shutdown.
         */

        try {

            await persistSessionFiles(
                key
            );

        } catch (error) {

            console.error(
                "Final session sync error:",
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

* Delete local authentication files.
*
* This does NOT delete the persisted database session.
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
    getSessionPath(
        key
    );


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