import * as adminUserService
    from "../services/adminUserService.js";


export async function getUsers(
    req,
    res
) {

    try {

        const users =
            await adminUserService.getUsers();

        res.json({

            success: true,

            users

        });

    } catch (error) {

        console.error(
            "Admin users error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to load users."

        });

    }

}