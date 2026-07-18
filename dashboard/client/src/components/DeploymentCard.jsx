import { apiRequest } from "../services/api";

function DeploymentCard({ deployment }) {


    async function pairBot() {

        try {

            const result =
                await apiRequest(
                    `/api/deployments/${deployment.id}/pair`,
                    {
                        method:"POST"
                    }
                );

            alert(result.message);


        } catch(error) {

            console.log(error);

            alert("Pairing failed.");

        }

    }



    async function startBot() {

        try {

            const result =
                await apiRequest(
                    `/api/deployments/${deployment.id}/start`,
                    {
                        method:"POST"
                    }
                );


            alert(result.message);

            window.location.reload();


        } catch(error) {

            console.log(error);

            alert("Start failed.");

        }

    }



    async function stopBot(){

        try{

            const result =
                await apiRequest(
                    `/api/deployments/${deployment.id}/stop`,
                    {
                        method:"POST"
                    }
                );


            alert(result.message);

            window.location.reload();


        }catch(error){

            console.log(error);

            alert("Stop failed.");

        }

    }




    async function deleteBot(){

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this deployment?"
            );


        if(!confirmDelete){
            return;
        }



        try{


            const result =
                await apiRequest(
                    `/api/deployments/${deployment.id}`,
                    {
                        method:"DELETE"
                    }
                );


            alert(result.message);

            window.location.reload();



        }catch(error){


            console.log(error);

            alert("Delete failed.");

        }

    }




    return (

        <div className="card">

            <h3>
                {deployment.botName}
            </h3>


            <p>
                Status: {deployment.status}
            </p>


            <p>
                JL Cost: {deployment.jlCost} JL
            </p>


            <div style={{marginTop:"15px"}}>


                <button onClick={pairBot}>
                    📱 Pair
                </button>


                <button onClick={startBot}>
                    ▶ Start
                </button>


                <button onClick={stopBot}>
                    ⏹ Stop
                </button>


                <button onClick={deleteBot}>
                    🗑 Delete
                </button>


            </div>


        </div>

    );

}


export default DeploymentCard;