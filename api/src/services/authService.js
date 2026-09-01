
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const JWT_SECRET = process.env.JWT_SECRET;

const WELCOME_BONUS_JL = 25;


export async function register({
    name,
    email,
    password
}) {

    if (!name || !email || !password) {

        throw new Error(
            "Name, email and password are required."
        );

    }


    if (password.length < 6) {

        throw new Error(
            "Password must be at least 6 characters."
        );

    }


    const normalizedEmail =
        email.trim().toLowerCase();


    const existingUser =
        await prisma.user.findUnique({

            where: {
                email: normalizedEmail
            }

        });


    if (existingUser) {

        throw new Error(
            "Email already exists."
        );

    }


    const hashedPassword =
        await bcrypt.hash(
            password,
            12
        );


    /*
     * Create the user, wallet and welcome bonus
     * atomically.
     *
     * Render + Supabase can sometimes take longer
     * to acquire a transaction connection, so use
     * a larger transaction wait/timeout.
     */

    const user =
        await prisma.$transaction(
            async (tx) => {

                const newUser =
                    await tx.user.create({

                        data: {

                            name:
                                name.trim(),

                            email:
                                normalizedEmail,

                            password:
                                hashedPassword,

                            role:
                                "CLIENT"

                        }

                    });


                const wallet =
                    await tx.wallet.create({

                        data: {

                            userId:
                                newUser.id,

                            balance:
                                WELCOME_BONUS_JL

                        }

                    });


                await tx.jLTransaction.create({

                    data: {

                        id:
                            crypto.randomUUID(),

                        userId:
                            newUser.id,

                        type:
                            "WELCOME_BONUS",

                        amount:
                            WELCOME_BONUS_JL,

                        balanceBefore:
                            0,

                        balanceAfter:
                            WELCOME_BONUS_JL,

                        description:
                            "Welcome bonus",

                        reference:
                            `WELCOME-${newUser.id}`

                    }

                });


                return {

                    ...newUser,

                    wallet

                };

            },

            {
                maxWait: 15000,
                timeout: 30000
            }

        );


    return sanitizeUser(user);

}


export async function login(
    email,
    password
) {

    if (!email || !password) {

        throw new Error(
            "Email and password are required."
        );

    }


    const user =
        await prisma.user.findUnique({

            where: {

                email:
                    email.trim().toLowerCase()

            },

            include: {

                wallet: true

            }

        });


    if (!user) {

        throw new Error(
            "Invalid email or password."
        );

    }


    const validPassword =
        await bcrypt.compare(
            password,
            user.password
        );


    if (!validPassword) {

        throw new Error(
            "Invalid email or password."
        );

    }


    const token =
        jwt.sign(

            {

                id:
                    user.id,

                email:
                    user.email,

                role:
                    user.role

            },

            JWT_SECRET,

            {

                expiresIn:
                    "7d"

            }

        );


    return {

        token,

        user:
            sanitizeUser(user)

    };

}


export async function getMe(
    id
) {

    const user =
        await prisma.user.findUnique({

            where: {
                id
            },

            include: {

                wallet: true

            }

        });


    if (!user) {

        throw new Error(
            "User not found."
        );

    }


    return sanitizeUser(user);

}


function sanitizeUser(
    user
) {

    return {

        id:
            user.id,

        name:
            user.name,

        email:
            user.email,

        role:
            user.role,

        wallet:
            user.wallet
                ? {

                    balance:
                        user.wallet.balance

                }
                : null,

        createdAt:
            user.createdAt

    };

}

