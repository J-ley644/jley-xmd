/**
 * JLEY-XMD Runtime Manager
 */

import config from "../config/config.js";

const startedAt = Date.now();

function getUptime() {

    const totalSeconds = Math.floor((Date.now() - startedAt) / 1000);

    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
        days,
        hours,
        minutes,
        seconds
    };

}

function formatUptime() {

    const {
        days,
        hours,
        minutes,
        seconds
    } = getUptime();

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;

}

export default {

    startedAt,

    getUptime,

    formatUptime,

    version() {
        return config.version;
    },

    botName() {
        return config.botName;
    }

};