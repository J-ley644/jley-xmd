import * as botService from "../services/botService.js";


export async function list(req, res) {

    try {

        const bots =
            await botService.listBots(
                req.user.id
            );

        res.json({
            success: true,
            bots
        });

    } catch (error) {

        console.error("List bots error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}


export async function getBot(req, res) {

    try {

        const bot =
            await botService.getBot(
                req.user.id,
                req.params.id
            );

        res.json({
            success: true,
            bot
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message
        });
    }
}


export async function stop(req, res) {

    try {

        const bot =
            await botService.stopBot(
                req.user.id,
                req.params.id
            );

        res.json({
            success: true,
            message: "Bot stopped.",
            bot
        });

    } catch (error) {

        console.error("Stop bot error:", error);

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}
