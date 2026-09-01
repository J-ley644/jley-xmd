import * as systemSettingService
    from "../services/systemSettingService.js";

import * as adminUserService
    from "../services/adminUserService.js";

import {
    adminCreditWallet
} from "../services/walletService.js";


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
| CREDIT USER WALLET
|--------------------------------------------------------------------------
*/

export async function creditUserWallet(
    req,
    res
) {

    try {

        const {
            userId,
            amount,
            description
        } = req.body;


        if (!userId) {

            return res.status(400).json({

                success: false,

                message:
                    "User ID is required."

            });

        }


        const creditAmount =
            Number(amount);


        if (
            !Number.isInteger(creditAmount) ||
            creditAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Amount must be a positive whole number."

            });

        }


        const wallet =
            await adminCreditWallet(
                userId,
                creditAmount,
                description ||
                "Admin JL credit"
            );


        return res.json({

            success: true,

            message:
                `${creditAmount} JL credited successfully.`,

            wallet

        });

    } catch (error) {

        console.error(
            "Admin wallet credit error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to credit wallet."

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