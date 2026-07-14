import pluginStore from "../system/pluginStore.js";
import config from "../config/config.js";
import logger from "../lib/logger.js";
import loadPlugins from "./pluginLoader.js";
import { setPlugins } from "./commandHandler.js";
import startWhatsApp from "../lib/whatsapp.js";


async function startBot() {

    try {

        logger.info("================================");
        logger.info("🚀 Starting JLEY-XMD");
        logger.info("================================");


        logger.info(
            `Bot Name: ${config.botName}`
        );


        logger.info(
            `Version: ${config.version}`
        );


        logger.info(
            `Mode: ${config.mode}`
        );



        /*
            Load command plugins
        */

        const plugins =
            await loadPlugins();



        /*
            Connect plugins to command engine
        */

        setPlugins(plugins);

        



        logger.info(
            "✅ Core system initialized"
        );


        await startWhatsApp();



    } catch(error) {


        logger.error(
            "Failed starting JLEY-XMD",
            error
        );


        process.exit(1);

    }

}



export default startBot;