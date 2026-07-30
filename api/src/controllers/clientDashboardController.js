import prisma from "../config/prisma.js";

export async function getClientDashboard(req, res) {
    try {

        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                wallet: true,
                deployments: {
                    orderBy: {
                        createdAt: "desc"
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        const deployments = user.deployments;

        const runningBots = deployments.filter(
            bot => bot.status === "RUNNING"
        ).length;

        const pendingBots = deployments.filter(
            bot => bot.status === "PENDING"
        ).length;

        const stoppedBots = deployments.filter(
            bot => bot.status === "STOPPED"
        ).length;

        res.json({
            success: true,

            dashboard: {

                name: user.name,

                email: user.email,

                jlBalance: user.wallet?.balance ?? 0,

                totalDeployments: deployments.length,

                runningBots,

                pendingBots,

                stoppedBots,

                deployments

            }

        });

    } catch (error) {

        console.error("CLIENT DASHBOARD ERROR:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load client dashboard."
        });

    }
}