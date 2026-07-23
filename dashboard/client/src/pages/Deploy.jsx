import { useState, useEffect } from "react";
import axios from "axios";
import "./Deploy.css";
import QRCode from "react-qr-code";



function Deploy() {


    const [botName, setBotName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [deployment, setDeployment] = useState(null);

    const [loading, setLoading] = useState(false);



    async function deployBot(){


        try{


            setLoading(true);


            const response =
                await axios.post(
                    "http://localhost:5000/api/client/deploy",
                    {
                        botName,
                        phoneNumber
                    }
                );



            console.log(
                "DEPLOY RESPONSE:",
                response.data
            );



            setDeployment(
                response.data.deployment
            );



        }catch(error){


            console.log(
                "DEPLOY ERROR:",
                error.response?.data || error.message
            );


        }finally{


            setLoading(false);


        }


    }

    useEffect(()=>{


    if(!deployment?.id)
        return;



    const interval =
        setInterval(async()=>{


            try{


                const response =
                    await axios.get(
                        `http://localhost:5000/api/client/deploy/${deployment.id}`
                    );


                console.log(
                    "DEPLOYMENT UPDATE:",
                    response.data
                );


                setDeployment(
                    response.data.deployment
                );



                if(
                    response.data.deployment.qrCode
                ){

                    clearInterval(interval);

                }


            }catch(error){


                console.log(
                    "QR CHECK ERROR:",
                    error.message
                );


            }


        },3000);



    return ()=>clearInterval(interval);



},[deployment?.id]);





    return (

        <div className="deploy-page">


            <div className="deploy-header">


                <h1>
                    🚀 Deploy WhatsApp Bot
                </h1>


                <p>
                    Create a new deployment and connect your WhatsApp account.
                </p>


            </div>





            <div className="deploy-grid">





                <div className="deploy-form">


                    <h2>
                        Deployment Details
                    </h2>



                    <label>
                        Bot Name
                    </label>


                    <input

                        value={botName}

                        onChange={
                            e=>setBotName(e.target.value)
                        }

                        type="text"

                        placeholder="My WhatsApp Bot"

                    />





                    <label>
                        Phone Number
                    </label>


                    <input

                        value={phoneNumber}

                        onChange={
                            e=>setPhoneNumber(e.target.value)
                        }

                        type="text"

                        placeholder="+2547XXXXXXXX"

                    />





                    <button
                        onClick={deployBot}
                        disabled={loading}
                    >

                        {
                            loading
                            ?
                            "Starting..."
                            :
                            "🚀 Deploy Bot"
                        }

                    </button>



                </div>







                <div className="deploy-status">


                    <h2>
                        Connection Status
                    </h2>




                    <div className="status waiting">


                        🟡 Waiting for deployment


                    </div>






                    <div className="qr-box">


                    {
                        deployment?.qrCode

                        ?

                        <QRCode

                            value={
                                deployment.qrCode
                            }

                            size={220}

                        />


                        :


                        <div className="qr-loading">


                            <div className="spinner"></div>


                            <p>
                                Waiting for QR Code...
                            </p>


                        </div>


                    }


                    </div>







                    <div className="pair-card">


                        Pairing Code


                        <h1>
                            {
                                deployment?.pairingCode
                                ||
                                "------"
                            }
                        </h1>


                    </div>



                </div>



            </div>



        </div>


    );


}


export default Deploy;