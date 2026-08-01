import fs from "fs";
import path from "path";

import { useMultiFileAuthState } from "@whiskeysockets/baileys";

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

export async function getAuthState(deploymentId) {

    const sessionPath =

        getSessionPath(deploymentId);

    return useMultiFileAuthState(sessionPath);

}

export function deleteSessionFolder(deploymentId) {

    const sessionPath =

        getSessionPath(deploymentId);

    if (fs.existsSync(sessionPath)) {

        fs.rmSync(sessionPath, {

            recursive: true,

            force: true

        });

    }

}