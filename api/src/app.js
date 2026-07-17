import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import deploymentRoutes from "./routes/deploymentRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.json({
        name:"JLEY-XMD API",
        status:"running"
    });
});


app.use("/api/auth", authRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/deployments", deploymentRoutes);
app.use("/api/wallet", walletRoutes);


export default app;