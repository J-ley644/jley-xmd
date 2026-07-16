import jwt from "jsonwebtoken";

const SECRET =
    process.env.JWT_SECRET ||
    "CHANGE_ME_IN_PRODUCTION";

export function createToken(user) {

    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            email: user.email
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