import prisma from "../config/prisma.js";


export async function getUsers() {

    return prisma.user.findMany({

        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        },

        orderBy: {
            createdAt: "desc"
        }

    });

}
