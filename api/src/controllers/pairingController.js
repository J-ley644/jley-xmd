import prisma from "../config/prisma.js";

import {

    startDeploymentSession,

    requestPairingCode,

    getDeploymentStatus

} from "../services/whatsapp/index.js";

export async function generatePairingCode(req, res) {

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

                success:false,
                message:"Deployment not found."

            });

        }


        const {
            phoneNumber
        } = req.body;


        if (!phoneNumber) {

            return res.status(400).json({

                success:false,
                message:"Phone number required."

            });

        }


        const result =
            await requestPairingCode(
                deployment.id,
                phoneNumber
            );


        res.json({

            success:true,

            ...result

        });


    } catch(error) {

        console.error(
            "Generate pairing code error:",
            error
        );


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

}


export async function startPairing(req, res) {

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

        const session =
            await startDeploymentSession(
                deployment.id
            );

        res.json({

            success: true,

            deploymentId: deployment.id,

            ...session
        });

    } catch (error) {

        console.error(
            "Start pairing error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to start pairing."
        });
    }
}


export async function getPairingStatus(
    req,
    res
) {

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

        const session =
            await getDeploymentStatus(
                deployment.id
            );

        res.json({

            success: true,

            deploymentId: deployment.id,

            ...session
        });

    } catch (error) {

        console.error(
            "Pairing status error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to get pairing status."
        });
    }
}


export async function stopPairing(
    req,
    res
) {

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

        await stopDeploymentSession(
            deployment.id
        );

        res.json({

            success: true,

            message: "WhatsApp session stopped."
        });

    } catch (error) {

        console.error(
            "Stop pairing error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to stop pairing."
        });
    }
}
