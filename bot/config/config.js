import dotenv from "dotenv";

dotenv.config();

const config = {

    botName: process.env.BOT_NAME || "JLEY-XMD",

    version: process.env.BOT_VERSION || "1.0.0",

    prefix: process.env.PREFIX || ".",

    mode: process.env.MODE || "public",


    owner: {

        name: "J.ley",

        number: "254702946278",

        lid: "185122200547532"

    },


    status: "online",

    repo: "https://github.com/J-ley644/jley-xmd"

};


export default config;