import "dotenv/config";
import prisma from "./src/config/prisma.js";

console.log("Deployments:", await prisma.deployment.count());
console.log("WhatsApp session files:", await prisma.whatsAppSession.count());
console.log("Users:", await prisma.user.count());

await prisma.$disconnect();