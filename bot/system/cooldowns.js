/**
 * JLEY-XMD Cooldown Manager
 *
 * Bounded in-memory cooldown tracking.
 */

class CooldownManager {

    constructor() {

        this.cooldowns = new Map();

    }


    check(
        user,
        command,
        seconds = 3
    ) {

        const key =
            `${user}:${command}`;

        const now =
            Date.now();


        /*
        |--------------------------------------------------------------------------
        | Existing cooldown
        |--------------------------------------------------------------------------
        */

        const lastUsed =
            this.cooldowns.get(
                key
            );


        if (
            lastUsed !== undefined
        ) {

            const expires =
                lastUsed +
                (
                    seconds *
                    1000
                );


            if (
                now < expires
            ) {

                return {

                    allowed: false,

                    remaining:
                        Math.ceil(
                            (
                                expires -
                                now
                            ) / 1000
                        )

                };

            }


            /*
            Cooldown expired.
            Remove the old entry before
            creating the new one.
            */

            this.cooldowns.delete(
                key
            );

        }


        /*
        |--------------------------------------------------------------------------
        | New cooldown
        |--------------------------------------------------------------------------
        */

        this.cooldowns.set(
            key,
            now
        );


        /*
        |--------------------------------------------------------------------------
        | Safety cleanup
        |--------------------------------------------------------------------------
        |
        | Prevent a large number of abandoned
        | keys from accumulating.
        |
        */

        if (
            this.cooldowns.size >
            5000
        ) {

            this.cleanup();

        }


        return {

            allowed: true,

            remaining: 0

        };

    }


    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    cleanup() {

        const now =
            Date.now();


        for (
            const [
                key,
                timestamp
            ]
            of this.cooldowns
        ) {

            /*
            Cooldowns are normally only a few
            seconds, so anything older than
            one hour is definitely stale.
            */

            if (
                now -
                timestamp >
                60 * 60 * 1000
            ) {

                this.cooldowns.delete(
                    key
                );

            }

        }

    }


    /*
    |--------------------------------------------------------------------------
    | Clear Everything
    |--------------------------------------------------------------------------
    */

    clear() {

        this.cooldowns.clear();

    }

}


export default new CooldownManager();