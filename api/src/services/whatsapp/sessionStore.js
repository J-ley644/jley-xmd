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
 *
 * Baileys can emit many creds.update events in a
 * very short period. Instead of hitting Supabase
 * for every event, we wait briefly and combine
 * them into one synchronization.
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
 * Restore authentication files from Supabase.
 */

async function restoreSessionFiles(deploymentId) {

    const sessionPath =
        getSessionPath(deploymentId);


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
                    String(deploymentId)

            }

        });


    for (const file of files) {

        const filePath =
            path.join(
                sessionPath,
                file.fileName
            );


        try {

            /*
             * Ignore dangerous or invalid paths.
             */

            if (
                file.fileName.includes("..") ||
                path.isAbsolute(file.fileName)
            ) {

                continue;

            }


            fs.writeFileSync(
                filePath,
                file.data,
                "utf8"
            );

        } catch (error) {

            console.error(
                `Failed restoring session file ${file.fileName}:`,
                error.message
            );

        }

    }


    console.log(
        `Restored ${files.length} session files for ${deploymentId}`
    );

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
                    fs.readdirSync(sessionPath);

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
                        fs.statSync(filePath);


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

                syncTimers.delete(key);


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


    await restoreSessionFiles(
        key
    );


    const sessionPath =
        getSessionPath(
            key
        );


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