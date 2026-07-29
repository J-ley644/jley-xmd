import prisma from "../config/prisma.js";


/*
|--------------------------------------------------------------------------
| Dashboard Statistics
|--------------------------------------------------------------------------
*/

export async function getDashboardStats(req, res) {

    try {

        const [
            totalClients,
            suspendedClients,
            blockedClients,
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

            prisma.user.count({
                where: {
                    role: "CLIENT",
                    suspended: true
                }
            }),

            prisma.user.count({
                where: {
                    role: "CLIENT",
                    blocked: true
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

                suspendedClients,

                blockedClients,

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


/*
|--------------------------------------------------------------------------
| Get Clients
|--------------------------------------------------------------------------
*/

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

                    suspended: true,

                    blocked: true,

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


/*
|--------------------------------------------------------------------------
| Suspend Client
|--------------------------------------------------------------------------
*/

export async function suspendClient(req, res) {

    try {

        const { userId } = req.params;


        const client =
            await prisma.user.findUnique({

                where: {
                    id: userId
                }

            });


        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client not found."

            });

        }


        if (client.role !== "CLIENT") {

            return res.status(400).json({

                success: false,

                message: "This account cannot be suspended."

            });

        }


        const updatedClient =
            await prisma.user.update({

                where: {
                    id: userId
                },

                data: {
                    suspended: true
                },

                select: {

                    id: true,

                    name: true,

                    email: true,

                    suspended: true,

                    blocked: true

                }

            });


        await prisma.adminAction.create({

            data: {

                adminId: req.user.id,

                targetUserId: userId,

                action: "SUSPEND_CLIENT",

                description:
                    `Suspended client ${client.email}`

            }

        });


        res.json({

            success: true,

            message: "Client suspended successfully.",

            client: updatedClient

        });

    } catch (error) {

        console.error(
            "ADMIN SUSPEND ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to suspend client."

        });

    }

}


/*
|--------------------------------------------------------------------------
| Unsuspend Client
|--------------------------------------------------------------------------
*/

export async function unsuspendClient(req, res) {

    try {

        const { userId } = req.params;


        const client =
            await prisma.user.findUnique({

                where: {
                    id: userId
                }

            });


        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client not found."

            });

        }


        const updatedClient =
            await prisma.user.update({

                where: {
                    id: userId
                },

                data: {
                    suspended: false
                },

                select: {

                    id: true,

                    name: true,

                    email: true,

                    suspended: true,

                    blocked: true

                }

            });


        await prisma.adminAction.create({

            data: {

                adminId: req.user.id,

                targetUserId: userId,

                action: "UNSUSPEND_CLIENT",

                description:
                    `Unsuspended client ${client.email}`

            }

        });


        res.json({

            success: true,

            message: "Client unsuspended successfully.",

            client: updatedClient

        });

    } catch (error) {

        console.error(
            "ADMIN UNSUSPEND ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to unsuspend client."

        });

    }

}


/*
|--------------------------------------------------------------------------
| Block Client
|--------------------------------------------------------------------------
*/

export async function blockClient(req, res) {

    try {

        const { userId } = req.params;


        const client =
            await prisma.user.findUnique({

                where: {
                    id: userId
                }

            });


        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client not found."

            });

        }


        if (client.role !== "CLIENT") {

            return res.status(400).json({

                success: false,

                message: "This account cannot be blocked."

            });

        }


        const updatedClient =
            await prisma.user.update({

                where: {
                    id: userId
                },

                data: {
                    blocked: true
                },

                select: {

                    id: true,

                    name: true,

                    email: true,

                    suspended: true,

                    blocked: true

                }

            });


        await prisma.adminAction.create({

            data: {

                adminId: req.user.id,

                targetUserId: userId,

                action: "BLOCK_CLIENT",

                description:
                    `Blocked client ${client.email}`

            }

        });


        res.json({

            success: true,

            message: "Client blocked successfully.",

            client: updatedClient

        });

    } catch (error) {

        console.error(
            "ADMIN BLOCK ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to block client."

        });

    }

}


/*
|--------------------------------------------------------------------------
| Unblock Client
|--------------------------------------------------------------------------
*/

export async function unblockClient(req, res) {

    try {

        const { userId } = req.params;


        const client =
            await prisma.user.findUnique({

                where: {
                    id: userId
                }

            });


        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client not found."

            });

        }


        const updatedClient =
            await prisma.user.update({

                where: {
                    id: userId
                },

                data: {
                    blocked: false
                },

                select: {

                    id: true,

                    name: true,

                    email: true,

                    suspended: true,

                    blocked: true

                }

            });


        await prisma.adminAction.create({

            data: {

                adminId: req.user.id,

                targetUserId: userId,

                action: "UNBLOCK_CLIENT",

                description:
                    `Unblocked client ${client.email}`

            }

        });


        res.json({

            success: true,

            message: "Client unblocked successfully.",

            client: updatedClient

        });

    } catch (error) {

        console.error(
            "ADMIN UNBLOCK ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to unblock client."

        });

    }

}


/*
|--------------------------------------------------------------------------
| Delete Client
|--------------------------------------------------------------------------
*/

export async function deleteClient(req, res) {

    try {

        const { userId } = req.params;


        const client =
            await prisma.user.findUnique({

                where: {
                    id: userId
                }

            });


        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client not found."

            });

        }


        if (client.role !== "CLIENT") {

            return res.status(400).json({

                success: false,

                message: "Admin accounts cannot be deleted here."

            });

        }


        await prisma.adminAction.create({

            data: {

                adminId: req.user.id,

                targetUserId: userId,

                action: "DELETE_CLIENT",

                description:
                    `Deleted client ${client.email}`

            }

        });


        await prisma.user.delete({

            where: {
                id: userId
            }

        });


        res.json({

            success: true,

            message: "Client deleted successfully."

        });

    } catch (error) {

        console.error(
            "ADMIN DELETE ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to delete client."

        });

    }

}


/*
|--------------------------------------------------------------------------
| Credit JL To Client
|--------------------------------------------------------------------------
*/

export async function creditClientJL(req, res) {

    try {

        const { userId } = req.params;

        const amount =
            Number(req.body.amount);


        if (!Number.isInteger(amount) || amount <= 0) {

            return res.status(400).json({

                success: false,

                message: "JL amount must be a positive whole number."

            });

        }


        const client =
            await prisma.user.findUnique({

                where: {
                    id: userId
                }

            });


        if (!client) {

            return res.status(404).json({

                success: false,

                message: "Client not found."

            });

        }


        if (client.role !== "CLIENT") {

            return res.status(400).json({

                success: false,

                message: "JL can only be credited to clients."

            });

        }


        const result =
            await prisma.$transaction(async (tx) => {

                const wallet =
                    await tx.wallet.upsert({

                        where: {
                            userId
                        },

                        create: {

                            userId,

                            balance: amount

                        },

                        update: {

                            balance: {
                                increment: amount
                            }

                        }

                    });


                await tx.adminAction.create({

                    data: {

                        adminId: req.user.id,

                        targetUserId: userId,

                        action: "CREDIT_JL",

                        amount,

                        description:
                            `Credited ${amount} JL to ${client.email}`

                    }

                });


                return wallet;

            });


        res.json({

            success: true,

            message:
                `${amount} JL credited successfully.`,

            wallet: {

                balance: result.balance

            }

        });

    } catch (error) {

        console.error(
            "ADMIN CREDIT JL ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to credit JL."

        });

    }

}


/*
|--------------------------------------------------------------------------
| Credit JL To All Clients
|--------------------------------------------------------------------------
*/

export async function creditAllClientsJL(req, res) {

    try {

        const amount =
            Number(req.body.amount);


        if (!Number.isInteger(amount) || amount <= 0) {

            return res.status(400).json({

                success: false,

                message: "JL amount must be a positive whole number."

            });

        }


        const clients =
            await prisma.user.findMany({

                where: {
                    role: "CLIENT"
                },

                select: {
                    id: true
                }

            });


        if (clients.length === 0) {

            return res.status(400).json({

                success: false,

                message: "There are no clients to credit."

            });

        }


        await prisma.$transaction(async (tx) => {

            for (const client of clients) {

                await tx.wallet.upsert({

                    where: {
                        userId: client.id
                    },

                    create: {

                        userId: client.id,

                        balance: amount

                    },

                    update: {

                        balance: {
                            increment: amount
                        }

                    }

                });

            }


            await tx.adminAction.create({

                data: {

                    adminId: req.user.id,

                    action: "CREDIT_ALL_JL",

                    amount,

                    description:
                        `Credited ${amount} JL to ${clients.length} clients`

                }

            });

        });


        res.json({

            success: true,

            message:
                `${amount} JL credited to ${clients.length} clients.`,

            clientsAffected:
                clients.length,

            amount

        });

    } catch (error) {

        console.error(
            "ADMIN CREDIT ALL JL ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to credit JL to clients."

        });

    }

}

