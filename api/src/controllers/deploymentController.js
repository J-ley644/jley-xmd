import * as deploymentService from "../services/deploymentService.js";

import {
    requestPairingCode
} from "../services/whatsapp/index.js";


export async function create(req, res) {

    try {

        const {
            botName
        } = req.body;


        if (!botName?.trim()) {

            return res.status(400).json({

                success: false,

                message: "Bot name is required."

            });

        }


        const result =
            await deploymentService.createDeployment(
                req.user.id,
                botName.trim()
            );


        res.status(201).json({

            success: true,

            message: "Deployment created successfully.",

            deployment: result.deployment,

            wallet: result.wallet

        });

    } catch (error) {

        console.error(
            "Create deployment error:",
            error
        );


        res.status(400).json({

            success: false,

            message: error.message

        });

    }

}


export async function start(req, res) {

    try {

        const result =
            await deploymentService.startDeployment(
                req.user.id,
                req.params.id
            );


        res.json({

            success: true,

            message: "Deployment session started.",

            ...result

        });

    } catch (error) {

        console.error(
            "Start deployment error:",
            error
        );


        res.status(400).json({

            success: false,

            message: error.message

        });

    }

}


export async function pair(req, res) {

    try {

        const {
            phoneNumber
        } = req.body;


        if (!phoneNumber?.trim()) {

            return res.status(400).json({

                success: false,

                message: "Phone number is required."

            });

        }


        /*
         * Verify that this deployment belongs
         * to the authenticated user before
         * generating a WhatsApp pairing code.
         */

        const deployment =
            await deploymentService.getDeployment(
                req.user.id,
                req.params.id
            );


        if (!deployment) {

            return res.status(404).json({

                success: false,

                message: "Deployment not found."

            });

        }


        const result =
            await requestPairingCode(
                req.params.id,
                phoneNumber.trim()
            );


        res.json({

            success: true,

            message: "Pairing code generated.",

            ...result

        });

    } catch (error) {

        console.error(
            "Pairing error:",
            error
        );


        res.status(400).json({

            success: false,

            message: error.message

        });

    }

}


export async function getOne(req, res) {

    try {

        const result =
            await deploymentService.getDeployment(
                req.user.id,
                req.params.id
            );


        res.json({

            success: true,

            ...result

        });

    } catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

}


export async function list(req, res) {

    try {

        const deployments =
            await deploymentService.listDeployments(
                req.user.id
            );


        res.json({

            success: true,

            deployments

        });

    } catch (error) {

        console.error(
            "List deployments error:",
            error
        );


        res.status(500).json({

            success: false,

            message: error.message

        });

    }

}


export async function stop(req, res) {

    try {

        const deployment =
            await deploymentService.stopDeployment(
                req.user.id,
                req.params.id
            );


        res.json({

            success: true,

            message: "Deployment stopped.",

            deployment

        });

    } catch (error) {

        console.error(
            "Stop deployment error:",
            error
        );


        res.status(400).json({

            success: false,

            message: error.message

        });

    }

}