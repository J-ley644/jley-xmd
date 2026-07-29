import auth from "./auth.js";


export default function admin(req, res, next) {

    auth(req, res, () => {

        if (!req.user) {

            return res.status(401).json({

                success: false,

                message: "Unauthorized."

            });

        }


        if (req.user.role !== "ADMIN") {

            return res.status(403).json({

                success: false,

                message: "Admin access required."

            });

        }


        next();

    });

}