import prisma from "../config/prisma.js";


const DEFAULT_SETTINGS = {
    JL_RATE_KES: "1.40",
    JL_DEPLOYMENT_COST: "50",
    JL_WELCOME_BONUS: "25"
};


/*
|--------------------------------------------------------------------------
| GET SETTING
|--------------------------------------------------------------------------
*/

export async function getSetting(key) {

    const setting =
        await prisma.systemSetting.findUnique({
            where: {
                key
            }
        });


    if (setting) {
        return setting.value;
    }


    const defaultValue =
        DEFAULT_SETTINGS[key];


    if (defaultValue === undefined) {
        return null;
    }


    /*
     * Automatically create missing default settings.
     */

    const created =
        await prisma.systemSetting.create({
            data: {
                key,
                value: defaultValue
            }
        });


    return created.value;
}


/*
|--------------------------------------------------------------------------
| SET SETTING
|--------------------------------------------------------------------------
*/

export async function setSetting(
    key,
    value
) {

    return prisma.systemSetting.upsert({

        where: {
            key
        },

        update: {
            value: String(value)
        },

        create: {
            key,
            value: String(value)
        }

    });

}


/*
|--------------------------------------------------------------------------
| GET ALL JL SETTINGS
|--------------------------------------------------------------------------
*/

export async function getJLSettings() {

    const keys = [
        "JL_RATE_KES",
        "JL_DEPLOYMENT_COST",
        "JL_WELCOME_BONUS"
    ];


    const settings = {};


    for (const key of keys) {

        settings[key] =
            await getSetting(key);

    }


    return {

        jlRateKES:
            Number(settings.JL_RATE_KES),

        deploymentCost:
            Number(settings.JL_DEPLOYMENT_COST),

        welcomeBonus:
            Number(settings.JL_WELCOME_BONUS)

    };

}


/*
|--------------------------------------------------------------------------
| UPDATE JL SETTINGS
|--------------------------------------------------------------------------
*/

export async function updateJLSettings({
    jlRateKES,
    deploymentCost,
    welcomeBonus
}) {

    if (
        jlRateKES !== undefined &&
        (
            !Number.isFinite(
                Number(jlRateKES)
            ) ||
            Number(jlRateKES) <= 0
        )
    ) {

        throw new Error(
            "JL rate must be greater than zero."
        );

    }


    if (
        deploymentCost !== undefined &&
        (
            !Number.isInteger(
                Number(deploymentCost)
            ) ||
            Number(deploymentCost) <= 0
        )
    ) {

        throw new Error(
            "Deployment cost must be a positive integer."
        );

    }


    if (
        welcomeBonus !== undefined &&
        (
            !Number.isInteger(
                Number(welcomeBonus)
            ) ||
            Number(welcomeBonus) < 0
        )
    ) {

        throw new Error(
            "Welcome bonus must be zero or a positive integer."
        );

    }


    if (jlRateKES !== undefined) {

        await setSetting(
            "JL_RATE_KES",
            Number(jlRateKES).toFixed(2)
        );

    }


    if (deploymentCost !== undefined) {

        await setSetting(
            "JL_DEPLOYMENT_COST",
            Math.floor(
                Number(deploymentCost)
            )
        );

    }


    if (welcomeBonus !== undefined) {

        await setSetting(
            "JL_WELCOME_BONUS",
            Math.floor(
                Number(welcomeBonus)
            )
        );

    }


    return getJLSettings();

}