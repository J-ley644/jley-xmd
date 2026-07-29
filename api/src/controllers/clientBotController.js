
import prisma from "../config/prisma.js";
import * as deploymentService from "../services/deploymentService.js";
import { startBotEngine } from "../services/botEngineService.js";


/*
|--------------------------------------------------------------------------
| Client Dashboard
|--------------------------------------------------------------------------
*/

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


        const deployments = client.deployments || [];


        const activeBots = deployments.filter(

            deployment =>
                deployment.status === "RUNNING"

        ).length;


        const connectedBots = deployments.filter(

            deployment =>
                deployment.connectionStatus === "CONNECTED" ||
                deployment.sessionReady === true

        ).length;


        const runningDeployments = deployments.filter(

            deployment =>
                deployment.status === "RUNNING"

        ).length;


        const stats = {

            activeBots,

            deployments: deployments.length,

            runningDeployments,

            connectedBots,

            jlBalance: client.wallet?.balance ?? 0

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
            message: "Failed to load client dashboard."

        });

    }

}


/*
|--------------------------------------------------------------------------
| Create Deployment
|--------------------------------------------------------------------------
*/

export async function createClientBot(req, res) {

    try {

        const { botName } = req.body;

        if (!botName) {

            return res.status(400).json({

                success: false,
                message: "Bot name required."

            });

        }


        /*
        |--------------------------------------------------------------------------
        | IMPORTANT
        |--------------------------------------------------------------------------
        | Never trust ownerId from the frontend.
        | The authenticated JWT determines the owner.
        |--------------------------------------------------------------------------
        */

        const ownerId = req.user.id;


        const deployment =
            await deploymentService.createDeployment({

                botName,
                ownerId

            });


        await startBotEngine(deployment);


        res.json({

            success: true,
            deployment

        });


    } catch (error) {

        console.error(
            "CREATE CLIENT BOT ERROR:",
            error
        );


        res.status(500).json({

            success: false,
            message: error.message

        });

    }

}


/*
|--------------------------------------------------------------------------
| Get Client Deployments
|--------------------------------------------------------------------------
*/

export async function getClientBots(req, res) {

    try {

        const bots =
            await prisma.deployment.findMany({

                where: {

                    ownerId: req.user.id

                },

                orderBy: {

                    createdAt: "desc"

                }

            });


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
            message: error.message

        });

    }

}


/*
|--------------------------------------------------------------------------
| Get Single Client Deployment
|--------------------------------------------------------------------------
*/

export async function getClientDeployment(req, res) {

    try {

        const deployment =
            await prisma.deployment.findFirst({

                where: {

                    id: req.params.id,

                    ownerId: req.user.id

                }

            });


        if (!deployment) {

            return res.status(404).json({

                success: false,
                message: "Deployment not found."

            });

        }


        res.json({

            success: true,
            deployment

        });


    } catch (error) {

        console.error(
            "GET CLIENT DEPLOYMENT ERROR:",
            error
        );


        res.status(500).json({

            success: false,
            message: error.message

        });

    }

}

