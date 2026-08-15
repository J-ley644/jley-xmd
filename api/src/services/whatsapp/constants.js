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

/*
 * WhatsApp automatic reconnect settings.
 *
 * Temporary connection failures should not permanently
 * deactivate a deployment.
 *
 * The bot will keep retrying with an increasing delay.
 */

export const RECONNECT_INITIAL_DELAY = 3000;

export const RECONNECT_MAX_DELAY = 60000;

export const RECONNECT_BACKOFF_MULTIPLIER = 1.5;