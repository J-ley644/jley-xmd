import "dotenv/config";

import app from "./app.js";

import {
    startDeploymentExpiryChecker
} from "./services/deploymentExpiryService.js";


const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(`
==================================
🚀 JLEY-XMD API Started
==================================
Port   : ${PORT}
Status : Running
==================================
`);


    startDeploymentExpiryChecker();

});