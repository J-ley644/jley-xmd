import prisma from "../config/prisma.js";
import {
    hashPassword,
    comparePassword
} from "../utils/hash.js";

import {
    createToken
} from "../utils/jwt.js";



export async function register(data) {

    const exists =
        await prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

    if (exists) {
        throw new Error(
            "Email already exists."
        );
    }

    const password =
        await hashPassword(
            data.password
        );

    const user =
    await prisma.user.create({

        data: {

            name: data.name,

            email: data.email,

            password,

            role: "CLIENT",

            wallet: {

                create: {

                    balance: 500

                }

            }

        }

    });

    return user;

}



export async function login(
    email,
    password
) {

    const user =
        await prisma.user.findUnique({

            where: {
                email
            }

        });

    if (!user) {

        throw new Error(
            "Invalid email or password."
        );

    }

    const valid =
        await comparePassword(
            password,
            user.password
        );

    if (!valid) {

        throw new Error(
            "Invalid email or password."
        );

    }

    const token =
        createToken(user);

    return {

        token,

        user: {

            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role

        }

    };

}