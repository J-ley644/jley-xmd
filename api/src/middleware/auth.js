import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export default function auth(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication required."
        });
    }

    const token = header.substring(7);

    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
        });
    }
}
