import jwt from "jsonwebtoken";

const SECRET =
    process.env.JWT_SECRET ||
    "CHANGE_ME_IN_PRODUCTION";

export default function auth(
    req,
    res,
    next
) {

    const authHeader =
        req.headers.authorization;

    if (!authHeader) {

        return res.status(401).json({

            success: false,

            message: "Access denied."

        });

    }

    const token =
        authHeader.replace(
            "Bearer ",
            ""
        );

    try {

        req.user =
            jwt.verify(
                token,
                SECRET
            );

        next();

    } catch {

        return res.status(401).json({

            success: false,

            message: "Invalid token."

        });

    }

}