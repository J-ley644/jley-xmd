import fs from "fs";
import path from "path";

import { useMultiFileAuthState } from "@whiskeysockets/baileys";

import prisma from "../../config/prisma.js";
import { SESSIONS_ROOT } from "./constants.js";

if (!fs.existsSync(SESSIONS_ROOT)) {
    fs.mkdirSync(SESSIONS_ROOT, {
        recursive: true
    });
}

export function getSessionPath(deploymentId) {
    return path.join(
        SESSIONS_ROOT,
        String(deploymentId)
    );
}

async function restoreSessionFiles(deploymentId) {
    const sessionPath = getSessionPath(deploymentId);

    fs.mkdirSync(sessionPath, {
        recursive: true
    });

    const files = await prisma.whatsAppSession.findMany({
        where: {
            deploymentId: String(deploymentId)
        }
    });

    for (const file of files) {
        const filePath = path.join(
            sessionPath,
            file.fileName
        );

        fs.writeFileSync(
            filePath,
            file.data,
            "utf8"
        );
    }

    console.log(
        `Restored ${files.length} session files for ${deploymentId}`
    );
}

async function persistSessionFiles(deploymentId) {
    const sessionPath = getSessionPath(deploymentId);

    if (!fs.existsSync(sessionPath)) {
        return;
    }

    const files = fs.readdirSync(sessionPath);

    for (const fileName of files) {
        const filePath = path.join(
            sessionPath,
            fileName
        );

        if (!fs.statSync(filePath).isFile()) {
            continue;
        }

        const data = fs.readFileSync(
            filePath,
            "utf8"
        );

        await prisma.whatsAppSession.upsert({
            where: {
                deploymentId_fileName: {
                    deploymentId: String(deploymentId),
                    fileName
                }
            },
            update: {
                data
            },
            create: {
                deploymentId: String(deploymentId),
                fileName,
                data
            }
        });
    }
}

export async function getAuthState(deploymentId) {

    const key = String(deploymentId);

    await restoreSessionFiles(key);

    const sessionPath =
        getSessionPath(key);

    const {
        state,
        saveCreds: originalSaveCreds
    } = await useMultiFileAuthState(
        sessionPath
    );


    const saveCreds = async () => {

        await originalSaveCreds();

        try {

            await persistSessionFiles(key);

        } catch (error) {

            console.error(
                "Session persistence error:",
                error.message
            );

        }

    };


    return {

        state,

        saveCreds,

        stopSync: () => {}

    };

}

export function deleteSessionFolder(deploymentId) {

    const sessionPath =
        getSessionPath(deploymentId);

    if (fs.existsSync(sessionPath)) {

        fs.rmSync(
            sessionPath,
            {
                recursive: true,
                force: true
            }
        );

    }

}