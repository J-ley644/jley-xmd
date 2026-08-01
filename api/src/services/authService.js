import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function register({ name, email, password }) {
    if (!name || !email || !password) {
        throw new Error("Name, email and password are required.");
    }

    if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
    });

    if (existingUser) {
        throw new Error("Email already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "CLIENT",
            wallet: {
                create: {
                    balance: 500
                }
            }
        },
        include: {
            wallet: true
        }
    });

    return sanitizeUser(user);
}

export async function login(email, password) {
    if (!email || !password) {
        throw new Error("Email and password are required.");
    }

    const user = await prisma.user.findUnique({
        where: {
            email: email.trim().toLowerCase()
        },
        include: {
            wallet: true
        }
    });

    if (!user) {
        throw new Error("Invalid email or password.");
    }

    const validPassword = await bcrypt.compare(
        password,
        user.password
    );

    if (!validPassword) {
        throw new Error("Invalid email or password.");
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return {
        token,
        user: sanitizeUser(user)
    };
}

export async function getMe(id) {
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            wallet: true
        }
    });

    if (!user) {
        throw new Error("User not found.");
    }

    return sanitizeUser(user);
}

function sanitizeUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        wallet: user.wallet
            ? {
                balance: user.wallet.balance
            }
            : null,
        createdAt: user.createdAt
    };
}
