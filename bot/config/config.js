import dotenv from "dotenv";

dotenv.config();

const config = {
    botName: process.env.BOT_NAME || "JLEY-XMD",

    version: process.env.BOT_VERSION || "1.0.0",

    prefix: process.env.PREFIX || ".",

    mode: process.env.MODE || "public",

    owner: {
        name: "J.ley",
        number: "254702946278"
    },

    status: "online"
};

export default config;