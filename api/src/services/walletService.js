import crypto from "node:crypto";
import prisma from "../config/prisma.js";


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


export async function getTransactions(userId) {

    return prisma.jLTransaction.findMany({

        where: {
            userId
        },

        orderBy: {
            createdAt: "desc"
        }

    });

}


export async function adminCreditWallet(
    userId,
    amount,
    description = "Admin JL credit"
) {

    if (!Number.isInteger(amount) || amount <= 0) {

        throw new Error(
            "Credit amount must be a positive whole number."
        );

    }


    return prisma.$transaction(async (tx) => {

        let wallet =
            await tx.wallet.findUnique({
                where: {
                    userId
                }
            });


        if (!wallet) {

            wallet =
                await tx.wallet.create({

                    data: {
                        userId,
                        balance: 0
                    }

                });

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


        await tx.jLTransaction.create({

            data: {

                id: crypto.randomUUID(),

                userId,

                type: "ADMIN_CREDIT",

                amount,

                balanceBefore,

                balanceAfter,

                description,

                reference:
                    `ADMIN-CREDIT-${crypto.randomUUID()}`

            }

        });


        return updatedWallet;

    });

}