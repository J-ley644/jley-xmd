import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const processes = new Map();

export function isRunning(botId) {
    return processes.has(botId);
}

export function startEngine(botId, options = {}) {
    if (processes.has(botId)) {
        return {
            running: true,
            message: "Bot engine is already running."
        };
    }

    /*
     * Engine entry point.
     *
     * Later this will launch the real JLEY-XMD WhatsApp
     * engine. For now we keep the process manager isolated
     * so deployment logic does not need to be rewritten.
     */

    const engineFile = path.join(
        __dirname,
        "../../engine/bot.js"
    );

    const child = spawn(
        process.execPath,
        [engineFile],
        {
            env: {
                ...process.env,
                BOT_ID: botId,
                BOT_NAME: options.name || "",
                BOT_SESSION: options.session || ""
            },
            stdio: ["ignore", "pipe", "pipe"]
        }
    );

    child.stdout.on("data", (data) => {
        console.log(
            `[BOT ${botId}] ${data.toString().trim()}`
        );
    });

    child.stderr.on("data", (data) => {
        console.error(
            `[BOT ${botId}] ${data.toString().trim()}`
        );
    });

    child.on("exit", (code) => {
        console.log(
            `[BOT ${botId}] Engine exited with code ${code}`
        );

        processes.delete(botId);
    });

    processes.set(botId, child);

    return {
        running: true,
        pid: child.pid
    };
}

export function stopEngine(botId) {
    const child = processes.get(botId);

    if (!child) {
        return false;
    }

    child.kill("SIGTERM");
    processes.delete(botId);

    return true;
}

export function stopAllEngines() {
    for (const [botId, child] of processes) {
        child.kill("SIGTERM");
        processes.delete(botId);
    }
}
