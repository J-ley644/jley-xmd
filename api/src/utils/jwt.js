import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
    throw new Error("JWT_SECRET is not configured.");
}

export function createToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        SECRET,
        {
            expiresIn: "7d"
        }
    );
}

export function verifyToken(token) {
    return jwt.verify(token, SECRET);
}
