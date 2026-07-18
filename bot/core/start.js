import pluginStore from "../system/pluginStore.js";
import config from "../config/config.js";
import logger from "../lib/logger.js";
import loadPlugins from "./pluginLoader.js";
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

        await loadPlugins();

        /*
            Connect plugins to command engine
        */

    
        logger.info(
            "✅ Core system initialized"
        );


        await startWhatsApp("main");



    } catch(error) {


        logger.error(error);


        process.exit(1);

    }

}



export default startBot;