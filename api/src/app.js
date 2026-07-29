
import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import deploymentRoutes from "./routes/deploymentRoutes.js";
import clientBotRoutes from "./routes/clientBotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const allowedOrigins = [
    "https://jley-xmd.netlify.app",
    "http://localhost:5173",
    "http://localhost:5174"
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests without an Origin header
            // such as server-to-server requests.
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(
                new Error("Not allowed by CORS")
            );

        }
    })
);

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

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

app.use(
    "/api/admin",
    adminRoutes
);

/*
|--------------------------------------------------------------------------
| Server Diagnostics
|--------------------------------------------------------------------------
*/

console.log(
    "JLEY-XMD API routes loaded."
);

export default app;

