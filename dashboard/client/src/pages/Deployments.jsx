import { useEffect, useState } from "react";
import { apiRequest } from "../services/api";
import DeploymentCard from "../components/DeploymentCard";


function Deployments() {

    const [deployments, setDeployments] = useState([]);

    const [botName, setBotName] = useState("");



    async function loadDeployments() {

        try {

            const data =
                await apiRequest(
                    "/api/deployments"
                );


            setDeployments(
                data.deployments
            );


        } catch(error) {

            console.log(error);

        }

    }



    useEffect(() => {

        loadDeployments();

    }, []);





    async function createDeployment() {

        try {


            await apiRequest(

                "/api/deployments/create",

                {

                    method:"POST",

                    body: JSON.stringify({

                        botName

                    })

                }

            );


            setBotName("");


            loadDeployments();



        } catch(error) {


            console.log(error);


        }

    }





    return (

        <div>


            <h1>
                Deployments
            </h1>



            <input

                placeholder="Bot Name"

                value={botName}

                onChange={(e)=>
                    setBotName(e.target.value)
                }

            />



            <button
                onClick={createDeployment}
            >

                Create Deployment

            </button>




            <br />
            <br />



            {
                deployments.map(
                    (deployment)=>(

                        <DeploymentCard

                            key={deployment.id}

                            deployment={deployment}

                        />

                    )
                )
            }



        </div>

    );

}


export default Deployments;