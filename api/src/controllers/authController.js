import * as authService from "../services/authService.js";



export async function register(req, res) {

    try {

        const user =
            await authService.register(
                req.body
            );

        res.status(201).json({

            success: true,

            message: "Account created successfully.",

            user: {

                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role

            }

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

}



export async function login(req, res) {

    try {

        const result =
            await authService.login(

                req.body.email,

                req.body.password

            );

        res.json({

            success: true,

            ...result

        });

    } catch (error) {

        res.status(401).json({

            success: false,

            message: error.message

        });

    }

}



export async function me(req, res) {

    res.json({

        success: true,

        user: req.user

    });

}