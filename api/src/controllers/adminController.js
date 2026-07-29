import prisma from "../config/prisma.js";


export async function getDashboardStats(req, res) {

    try {

        const [

            totalClients,

            totalDeployments,

            runningDeployments,

            pendingDeployments,

            stoppedDeployments,

            failedDeployments,

            totalPayments,

            successfulPayments,

            wallets

        ] = await Promise.all([

            prisma.user.count({
                where: {
                    role: "CLIENT"
                }
            }),

            prisma.deployment.count(),

            prisma.deployment.count({
                where: {
                    status: "RUNNING"
                }
            }),

            prisma.deployment.count({
                where: {
                    status: "PENDING"
                }
            }),

            prisma.deployment.count({
                where: {
                    status: "STOPPED"
                }
            }),

            prisma.deployment.count({
                where: {
                    status: "FAILED"
                }
            }),

            prisma.payment.count(),

            prisma.payment.count({
                where: {
                    status: "SUCCESS"
                }
            }),

            prisma.wallet.findMany({
                select: {
                    balance: true
                }
            })

        ]);


        const totalJLBalance =
            wallets.reduce(
                (total, wallet) =>
                    total + wallet.balance,
                0
            );


        res.json({

            success: true,

            stats: {

                totalClients,

                totalDeployments,

                runningDeployments,

                pendingDeployments,

                stoppedDeployments,

                failedDeployments,

                totalPayments,

                successfulPayments,

                totalJLBalance

            }

        });


    } catch (error) {

        console.error(
            "ADMIN DASHBOARD ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to load admin dashboard."

        });

    }

}





export async function getClients(req, res) {

    try {

        const clients =
            await prisma.user.findMany({

                where: {
                    role: "CLIENT"
                },

                select: {

                    id: true,

                    name: true,

                    email: true,

                    role: true,

                    createdAt: true,

                    updatedAt: true,

                    wallet: {

                        select: {

                            balance: true

                        }

                    },

                    deployments: {

                        select: {

                            id: true,

                            botName: true,

                            status: true,

                            createdAt: true,

                            updatedAt: true,

                            connectionStatus: true,

                            lastConnected: true,

                            sessionReady: true

                        },

                        orderBy: {

                            createdAt: "desc"

                        }

                    }

                },

                orderBy: {

                    createdAt: "desc"

                }

            });


        res.json({

            success: true,

            clients

        });


    } catch (error) {

        console.error(
            "ADMIN CLIENTS ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Failed to load clients."

        });

    }

}