import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
res.json({
success: true,
service: "JLEY-XMD API",
status: "online"
});
});

app.get("/api/status", (req, res) => {
res.json({
success: true,
bot: "JLEY-XMD",
version: "1.0.0",
mode: "public",
status: "online"
});
});

app.listen(PORT, () => {
console.log(`JLEY-XMD API running on port ${PORT}`);
});
