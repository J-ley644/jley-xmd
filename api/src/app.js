import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import botRoutes from "./routes/botRoutes.js";
import deploymentRoutes from "./routes/deploymentRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import pairingRoutes from "./routes/pairingRoutes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
    res.json({
        success: true,
        name: "JLEY-XMD API",
        version: "1.0.0",
        status: "running"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        service: "JLEY-XMD API",
        status: "healthy"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/bots", botRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/pairing", pairingRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found."
    });
});

app.use((err, req, res, next) => {
    console.error(err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error."
    });
});

export default app;
