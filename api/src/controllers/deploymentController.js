import * as deploymentService from "../services/deploymentService.js";


export async function getDeployments(req, res) {

    try {

        const deployments =
            await deploymentService.getDeployments();


        res.json({

            success: true,

            deployments

        });


    } catch (error) {

        console.log(error);


        res.status(500).json({

            success:false,

            message:"Failed to fetch deployments."

        });

    }

}



export async function createDeployment(req, res) {

    try {


        if (!req.user) {

            return res.status(401).json({

                success:false,

                message:"Unauthorized."

            });

        }



        const deployment =
            await deploymentService.createDeployment({

                botName:req.body.botName,

                ownerId:req.user.id

            });



        res.status(201).json({

            success:true,

            message:"Deployment created successfully.",

            deployment

        });



    } catch(error) {


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

}




export async function pairDeployment(req,res){

    try {


        const deployment =
            await deploymentService.getDeployment(
                req.params.id
            );



        if(!deployment){

            return res.status(404).json({

                success:false,

                message:"Deployment not found."

            });

        }



        res.json({

            success:true,

            message:"Pairing request received.",

            deploymentId:deployment.id

        });



    } catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

}




export async function startDeployment(req,res){

    try {


        const bot =
            await deploymentService.startDeployment(
                req.params.id
            );


        res.json({

            success:true,

            message:"Bot started.",

            bot

        });


    } catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });


    }

}




export async function getDeployment(req,res){

    try {


        const deployment =
            await deploymentService.getDeployment(
                req.params.id
            );



        if(!deployment){

            return res.status(404).json({

                success:false,

                message:"Deployment not found."

            });

        }



        res.json({

            success:true,

            deployment

        });



    } catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

}




export async function updateDeploymentStatus(req,res){

    try {


        const deployment =
            await deploymentService.updateDeploymentStatus(

                req.params.id,

                req.body.status

            );



        res.json({

            success:true,

            deployment

        });



    } catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

}




export async function deleteDeployment(req,res){

    try {


        await deploymentService.deleteDeployment(
            req.params.id
        );



        res.json({

            success:true,

            message:"Deployment deleted."

        });



    } catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:error.message

        });

    }

}

export async function stopDeployment(req, res) {

    try {

        const deployment =
            await deploymentService.updateDeploymentStatus(
                req.params.id,
                "STOPPED"
            );

        res.json({

            success: true,

            message: "Bot stopped.",

            deployment

        });

    } catch(error) {

        console.log(error);

        res.status(500).json({

            success:false,

            message:error.message

        });

    }

}