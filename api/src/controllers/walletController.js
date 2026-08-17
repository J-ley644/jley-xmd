import * as walletService
    from "../services/walletService.js";


export async function balance(
    req,
    res
) {

    try {

        const wallet =
            await walletService.getWallet(
                req.user.id
            );


        res.json({

            success: true,

            wallet: {

                balance:
                    wallet.balance,

                currency: "JL"

            }

        });

    } catch (error) {

        res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

}


export async function transactions(
    req,
    res
) {

    try {

        const transactions =
            await walletService.getTransactions(
                req.user.id
            );


        res.json({

            success: true,

            transactions

        });

    } catch (error) {

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

}