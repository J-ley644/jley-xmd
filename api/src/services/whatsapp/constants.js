import path from "path";

export const SESSIONS_ROOT = path.resolve("./sessions");

export const CONNECTION = {

    OFFLINE: "OFFLINE",

    CONNECTING: "CONNECTING",

    QR_READY: "QR_READY",

    CONNECTED: "CONNECTED"

};

export const DEFAULT_BROWSER = [

    "JLEY-XMD",

    "Chrome",

    "1.0.0"

];

export const RECONNECT_DELAY = 3000;

export const MAX_RECONNECT_ATTEMPTS = 20;