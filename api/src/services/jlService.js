import prisma from "../config/prisma.js";
import crypto from "node:crypto";


/*
|--------------------------------------------------------------------------
| JL WALLET SERVICE
|--------------------------------------------------------------------------
|
| This service is the single source of truth for JL balance changes.
|
| Every JL movement must create a JLTransaction record.
|
*/


/*
|--------------------------------------------------------------------------
| GET WALLET
|--------------------------------------------------------------------------
*/

export async function getWallet(userId) {

    const wallet =
        await prisma.wallet.findUnique({
            where: {
                userId
            }
        });


    if (!wallet) {

        throw new Error(
            "Wallet not found."
        );

    }


    return wallet;
}


/*
|--------------------------------------------------------------------------
| GET BALANCE
|--------------------------------------------------------------------------
*/

export async function getBalance(userId) {

    const wallet =
        await getWallet(userId);

    return wallet.balance;
}


/*
|--------------------------------------------------------------------------
| CREDIT JL
|--------------------------------------------------------------------------
*/

export async function creditJL({
    userId,
    amount,
    type,
    description,
    reference = null
}) {

    if (!Number.isInteger(amount) || amount <= 0) {

        throw new Error(
            "JL credit amount must be a positive integer."
        );

    }


    if (!type) {

        throw new Error(
            "JL transaction type is required."
        );

    }


    return prisma.$transaction(
        async (tx) => {

            const wallet =
                await tx.wallet.findUnique({
                    where: {
                        userId
                    }
                });


            if (!wallet) {

                throw new Error(
                    "Wallet not found."
                );

            }


            const balanceBefore =
                wallet.balance;


            const balanceAfter =
                balanceBefore + amount;


            const updatedWallet =
                await tx.wallet.update({

                    where: {
                        userId
                    },

                    data: {
                        balance: balanceAfter
                    }

                });


            const transaction =
                await tx.jLTransaction.create({

                    data: {

                        id:
                            crypto.randomUUID(),

                        userId,

                        type,

                        amount,

                        balanceBefore,

                        balanceAfter,

                        description,

                        reference

                    }

                });


            return {
                wallet: updatedWallet,
                transaction
            };

        }
    );

}


/*
|--------------------------------------------------------------------------
| DEBIT JL
|--------------------------------------------------------------------------
*/

export async function debitJL({
    userId,
    amount,
    type,
    description,
    reference = null
}) {

    if (!Number.isInteger(amount) || amount <= 0) {

        throw new Error(
            "JL debit amount must be a positive integer."
        );

    }


    if (!type) {

        throw new Error(
            "JL transaction type is required."
        );

    }


    return prisma.$transaction(
        async (tx) => {

            const wallet =
                await tx.wallet.findUnique({
                    where: {
                        userId
                    }
                });


            if (!wallet) {

                throw new Error(
                    "Wallet not found."
                );

            }


            const balanceBefore =
                wallet.balance;


            if (balanceBefore < amount) {

                throw new Error(
                    `Insufficient JL balance. You need ${amount} JL.`
                );

            }


            const balanceAfter =
                balanceBefore - amount;


            const updatedWallet =
                await tx.wallet.update({

                    where: {
                        userId
                    },

                    data: {
                        balance: balanceAfter
                    }

                });


            const transaction =
                await tx.jLTransaction.create({

                    data: {

                        id:
                            crypto.randomUUID(),

                        userId,

                        type,

                        amount: -amount,

                        balanceBefore,

                        balanceAfter,

                        description,

                        reference

                    }

                });


            return {
                wallet: updatedWallet,
                transaction
            };

        }
    );

}


/*
|--------------------------------------------------------------------------
| TRANSACTIONS
|--------------------------------------------------------------------------
*/

export async function getTransactions(
    userId
) {

    return prisma.jLTransaction.findMany({

        where: {
            userId
        },

        orderBy: {
            createdAt: "desc"
        }

    });

}


/*
|--------------------------------------------------------------------------
| PURCHASE CALCULATION
|--------------------------------------------------------------------------
|
| Example:
|
| 50 JL = KES 70
|
| Therefore:
|
| KES 70  = 50 JL
| KES 140 = 100 JL
| KES 700 = 500 JL
|
*/

export function calculateJL(
    amountKES,
    rateKESPerJL
) {

    const amount =
        Number(amountKES);


    const rate =
        Number(rateKESPerJL);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        throw new Error(
            "Payment amount must be greater than zero."
        );

    }


    if (
        !Number.isFinite(rate) ||
        rate <= 0
    ) {

        throw new Error(
            "Invalid JL conversion rate."
        );

    }


    const jlAmount =
        Math.floor(
            amount / rate
        );


    if (jlAmount <= 0) {

        throw new Error(
            "Payment amount is too small to purchase JL."
        );

    }


    return jlAmount;

}