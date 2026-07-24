import dotenv from "dotenv";

import startBot from "./bot/core/start.js";

import app from "./api/src/app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`
==================================
🚀 JLEY-XMD API Started
==================================
Port   : ${PORT}
Status : Running
==================================
`);

});

startBot();