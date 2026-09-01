import * as adminUserService
    from "../services/adminUserService.js";

import {
    adminCreditWallet
} from "../services/walletService.js";


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
            "Admin users error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load users."

        });

    }

}


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