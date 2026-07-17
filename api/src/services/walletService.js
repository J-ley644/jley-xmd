import prisma from "../config/prisma.js";


export async function getWallet(userId){

    let wallet = await prisma.wallet.findUnique({

        where:{
            userId
        }

    });


    if(!wallet){

        wallet = await prisma.wallet.create({

            data:{

                userId,

                balance:500

            }

        });

    }


    return wallet;

}



export async function deductJL(userId, amount){


    const wallet = await getWallet(userId);


    if(wallet.balance < amount){

        throw new Error("Not enough JL");

    }


    return prisma.wallet.update({

        where:{
            userId
        },

        data:{

            balance:{
                decrement: amount
            }

        }

    });


}