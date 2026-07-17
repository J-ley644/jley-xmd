import { Router } from "express";
import prisma from "../config/prisma.js";

const router = Router();


router.get("/stats", async (req, res) => {

    try {

        const totalBots = await prisma.bot.count();

        const onlineBots = await prisma.bot.count({
            where:{
                status:"ONLINE"
            }
        });


        const totalUsers = await prisma.user.count();


        const recentLogs = await prisma.log.findMany({
            take:5,
            orderBy:{
                createdAt:"desc"
            },
            include:{
                bot:true
            }
        });



        const bots = await prisma.bot.findMany({
            take:10,
            orderBy:{
                createdAt:"desc"
            },
            select:{
                name:true,
                status:true,
                createdAt:true
            }
        });



        res.json({

            stats:{
                users: totalUsers,
                bots: totalBots,
                onlineBots
            },


            bots,


            activities: recentLogs.map(log=>({

                event: log.event,
                type: log.type,
                bot: log.bot?.name || "Unknown",
                time: log.createdAt

            }))


        });


    } catch(error){

        console.error(error);

        res.status(500).json({
            message:"Dashboard data failed"
        });

    }


});


export default router;