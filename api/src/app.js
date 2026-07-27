import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import deploymentRoutes from "./routes/deploymentRoutes.js";
import clientBotRoutes from "./routes/clientBotRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

/*
|--------------------------------------------------------------------------
| Root Route
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {

    res.json({

        success: true,

        application: "JLEY-XMD",

        status: "ONLINE",

        version: "1.0.0",

        message: "Welcome to the JLEY-XMD API"

    });

});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/deployments",
    deploymentRoutes
);

app.use(
    "/api/client",
    clientBotRoutes
);

console.log(
    "REGISTERED DEPLOYMENT ROUTES:",
    app._router?.stack
        ?.filter(layer => layer.route)
        .map(layer => ({
            path: layer.route.path,
            methods: layer.route.methods
        }))
);

export default app;