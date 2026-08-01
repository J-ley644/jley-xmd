const sessions = new Map();

const locks = new Map();

const reconnectTimers = new Map();

export function getSession(id) {

    return sessions.get(String(id));

}

export function hasSession(id) {

    return sessions.has(String(id));

}

export function setSession(id, session) {

    sessions.set(String(id), session);

    return session;

}

export function removeSession(id) {

    sessions.delete(String(id));

}

export function getAllSessions() {

    return [...sessions.values()];

}

export function hasLock(id) {

    return locks.has(String(id));

}

export function getLock(id) {

    return locks.get(String(id));

}

export function setLock(id, promise) {

    locks.set(String(id), promise);

}

export function clearLock(id) {

    locks.delete(String(id));

}

export function getReconnectTimer(id) {

    return reconnectTimers.get(String(id));

}

export function setReconnectTimer(id, timer) {

    reconnectTimers.set(String(id), timer);

}

export function clearReconnectTimer(id) {

    const timer = reconnectTimers.get(String(id));

    if (timer) {

        clearTimeout(timer);

    }

    reconnectTimers.delete(String(id));

}