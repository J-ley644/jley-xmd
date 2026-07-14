/**
 * JLEY-XMD Cooldown Manager
 */

class CooldownManager {

    constructor() {
        this.cooldowns = new Map();
    }

    check(user, command, seconds = 3) {

        const key = `${user}:${command}`;

        const now = Date.now();

        if (!this.cooldowns.has(key)) {

            this.cooldowns.set(key, now);

            return {
                allowed: true,
                remaining: 0
            };

        }

        const expires =
            this.cooldowns.get(key) +
            (seconds * 1000);

        if (now < expires) {

            return {

                allowed: false,

                remaining:
                    Math.ceil(
                        (expires - now) / 1000
                    )

            };

        }

        this.cooldowns.set(key, now);

        return {

            allowed: true,

            remaining: 0

        };

    }

}

export default new CooldownManager();