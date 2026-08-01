import prisma from "../config/prisma.js";

export async function getWallet(userId) {
    const wallet = await prisma.wallet.findUnique({
        where: {
            userId
        }
    });

    if (!wallet) {
        throw new Error("Wallet not found.");
    }

    return wallet;
}

export async function getTransactions(userId) {
    return prisma.payment.findMany({
        where: {
            userId
        },
        orderBy: {
            createdAt: "desc"
        }
    });
}
