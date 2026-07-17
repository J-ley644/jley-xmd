import { getWallet } from "../services/walletService.js";


export async function getMyWallet(req,res){

    try {

        const wallet = await getWallet(
            req.user.id
        );


        res.json(wallet);


    } catch(error){

        console.log(error.message);


        res.status(500).json({

            error:error.message

        });

    }

}