import * as systemSettingService
    from "../services/systemSettingService.js";

import * as adminUserService
    from "../services/adminUserService.js";


/*
|--------------------------------------------------------------------------
| GET USERS
|--------------------------------------------------------------------------
*/

export async function getUsers(
    req,
    res
) {

    try {

        const users =
            await adminUserService.getUsers();


        res.json({

            success: true,

            users

        });

    } catch (error) {

        console.error(
            "Get admin users error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

}


/*
|--------------------------------------------------------------------------
| GET JL SETTINGS
|--------------------------------------------------------------------------
*/

export async function getJLSettings(
    req,
    res
) {

    try {

        const settings =
            await systemSettingService
                .getJLSettings();


        res.json({

            success: true,

            settings

        });

    } catch (error) {

        console.error(
            "Get JL settings error:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

}


/*
|--------------------------------------------------------------------------
| UPDATE JL SETTINGS
|--------------------------------------------------------------------------
*/

export async function updateJLSettings(
    req,
    res
) {

    try {

        const settings =
            await systemSettingService
                .updateJLSettings(
                    req.body
                );


        res.json({

            success: true,

            message:
                "JL settings updated successfully.",

            settings

        });

    } catch (error) {

        console.error(
            "Update JL settings error:",
            error
        );


        res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

}