import prisma from "../config/prisma.js";
import * as deploymentService from "../services/deploymentService.js";

/*                                                                         |
| -------------------------------------------------------------------------- |
| Client Dashboard                                                           |
| -------------------------------------------------------------------------- |
| */                                                                         

export async function getClientDashboard(req, res) {


try {

    const userId = req.user.id;

    const client = await prisma.user.findUnique({

        where: {
            id: userId
        },

        select: {

            id: true,
            name: true,
            email: true,
            role: true,
            suspended: true,
            blocked: true,
            createdAt: true,

            wallet: {

                select: {

                    balance: true

                }

            },

            deployments: {

                orderBy: {

                    createdAt: "desc"

                },

                select: {

                    id: true,
                    botName: true,
                    status: true,
                    jlCost: true,

                    createdAt: true,
                    updatedAt: true,

                    activatedAt: true,
                    expiresAt: true,

                    lastConnected: true,

                    qrCode: true,
                    sessionReady: true,
                    connectionStatus: true,

                    pairingCode: true,
                    phoneNumber: true,
                    sessionId: true

                }

            }

        }

    });


    if (!client) {

        return res.status(404).json({

            success: false,
            message: "Client account not found."

        });

    }


    const deployments =
        client.deployments || [];


    /*
    |--------------------------------------------------------------------------
    | ACTIVE BOTS
    |--------------------------------------------------------------------------
    */

    const activeBots =
        deployments.filter(

            deployment =>
                deployment.status === "RUNNING"

        ).length;


    /*
    |--------------------------------------------------------------------------
    | CONNECTED BOTS
    |--------------------------------------------------------------------------
    */

    const connectedBots =
        deployments.filter(

            deployment =>
                deployment.connectionStatus === "CONNECTED" ||
                deployment.sessionReady === true

        ).length;


    /*
    |--------------------------------------------------------------------------
    | RUNNING DEPLOYMENTS
    |--------------------------------------------------------------------------
    */

    const runningDeployments =
        deployments.filter(

            deployment =>
                deployment.status === "RUNNING"

        ).length;


    /*
    |--------------------------------------------------------------------------
    | EXPIRING / EXPIRED INFORMATION
    |--------------------------------------------------------------------------
    */

    const now = new Date();


    const expiredDeployments =
        deployments.filter(

            deployment =>
                deployment.expiresAt &&
                deployment.expiresAt <= now

        ).length;


    const stats = {

        activeBots,

        deployments:
            deployments.length,

        runningDeployments,

        connectedBots,

        expiredDeployments,

        jlBalance:
            client.wallet?.balance ?? 0

    };


    res.json({

        success: true,

        client: {

            id: client.id,

            name: client.name,

            email: client.email,

            role: client.role,

            suspended: client.suspended,

            blocked: client.blocked,

            createdAt: client.createdAt

        },

        stats,

        deployments

    });


} catch (error) {

    console.error(
        "CLIENT DASHBOARD ERROR:",
        error
    );


    res.status(500).json({

        success: false,

        message:
            "Failed to load client dashboard."

    });

}


}

 /*                                                                         |
| -------------------------------------------------------------------------- |
| CREATE DEPLOYMENT                                                          |
| -------------------------------------------------------------------------- |
| */                                                                         

export async function createClientBot(req, res) {


try {

    const { botName } = req.body;


    if (!botName) {

        return res.status(400).json({

            success: false,

            message:
                "Bot name required."

        });

    }


    /*
    |--------------------------------------------------------------------------
    | NEVER TRUST ownerId FROM FRONTEND
    |--------------------------------------------------------------------------
    |
    | The authenticated JWT determines the owner.
    |
    */

    const ownerId =
        req.user.id;


    /*
    |--------------------------------------------------------------------------
    | CREATE DEPLOYMENT
    |--------------------------------------------------------------------------
    */

    const deployment =
        await deploymentService.createDeployment({

            botName,

            ownerId

        });


    /*
    |--------------------------------------------------------------------------
    | START DEPLOYMENT THROUGH SERVICE
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | Do NOT call startBotEngine() directly here.
    |
    | deploymentService.startDeployment() is the controlled entry point.
    |
    */

    const botInstance =
        await deploymentService.startDeployment(

            deployment.id,

            ownerId

        );


    /*
    |--------------------------------------------------------------------------
    | RETURN FRESH DATABASE RECORD
    |--------------------------------------------------------------------------
    */

    const updatedDeployment =
        await deploymentService.getDeployment(

            deployment.id,

            ownerId

        );


    res.status(201).json({

        success: true,

        deployment:
            updatedDeployment,

        bot: {

            deploymentId:
                botInstance.deploymentId,

            status:
                botInstance.status

        }

    });


} catch (error) {

    console.error(
        "CREATE CLIENT BOT ERROR:",
        error
    );


    res.status(500).json({

        success: false,

        message:
            error.message ||
            "Failed to create deployment."

    });

}


}

 /*                                                                         |
| -------------------------------------------------------------------------- |
| GET CLIENT DEPLOYMENTS                                                     |
| -------------------------------------------------------------------------- |
| */                                                                         

export async function getClientBots(req, res) {


try {

    const bots =
        await deploymentService.getDeployments(

            req.user.id

        );


    res.json({

        success: true,

        bots

    });


} catch (error) {

    console.error(
        "GET CLIENT BOTS ERROR:",
        error
    );


    res.status(500).json({

        success: false,

        message:
            error.message

    });

}


}

/*                                                                         |
| -------------------------------------------------------------------------- |
| GET SINGLE CLIENT DEPLOYMENT                                               |
| -------------------------------------------------------------------------- |
| */                                                                         

export async function getClientDeployment(req, res) {


try {

    const deployment =
        await deploymentService.getDeployment(

            req.params.id,

            req.user.id

        );


    if (!deployment) {

        return res.status(404).json({

            success: false,

            message:
                "Deployment not found."

        });

    }


    /*
    |--------------------------------------------------------------------------
    | EXPIRY INFORMATION
    |--------------------------------------------------------------------------
    */

    const now = new Date();


    const expired =
        deployment.expiresAt &&
        deployment.expiresAt <= now;


    res.json({

        success: true,

        deployment,

        lifespan: {

            activatedAt:
                deployment.activatedAt,

            expiresAt:
                deployment.expiresAt,

            expired

        }

    });


} catch (error) {

    console.error(
        "GET CLIENT DEPLOYMENT ERROR:",
        error
    );


    res.status(500).json({

        success: false,

        message:
            error.message

    });

}


}
