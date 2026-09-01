import crypto from "crypto";

export function generateSessionId() {
    return `JLEY${crypto
        .randomBytes(192)
        .toString("base64")
        .replace(/\+/g, "x")
        .replace(/\//g, "y")
        .replace(/=/g, "")
    }`;
}