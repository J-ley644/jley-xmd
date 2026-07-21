import { useState, useEffect } from "react";
import { apiRequest } from "../services/api";
import QRCode from "qrcode";

function Deploy() {

    const [botName, setBotName] = useState("");
    const [deploymentId, setDeploymentId] = useState(null);
    const [deployment, setDeployment] = useState(null);
    const [message, setMessage] = useState("");
    const [qrImage, setQrImage] = useState("");



    async function startDeployment() {

        try {

            const result = await apiRequest(
                "/api/client/deploy",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        botName
                    })
                }
            );

            const id = result.deployment.id;

            setDeploymentId(id);

            await apiRequest(
                `/api/deployments/${id}/start`,
                {
                    method: "POST"
                }
            );

            setMessage("Generating QR Code...");
            setBotName("");

        } catch (error) {

            console.log(error);
            setMessage("Deployment failed.");

        }

    }



    useEffect(() => {

        if (!deploymentId) return;

        const timer = setInterval(async () => {

            try {

                const result = await apiRequest(
                    `/api/client/deploy/${deploymentId}`
                );

                setDeployment(result.deployment);

if (result.deployment.qrCode) {

    const image = await QRCode.toDataURL(
        result.deployment.qrCode
    );

    setQrImage(image);

}

            } catch (error) {

                console.log(error);

            }

        }, 2000);

        return () => clearInterval(timer);

    }, [deploymentId]);



    return (

        <div className="home">

            <h1>Deploy Your JLEY-XMD Bot</h1>

            <input
                placeholder="Bot Name"
                value={botName}
                onChange={(e)=>setBotName(e.target.value)}
            />

            <button onClick={startDeployment}>
                Start Deployment
            </button>

            <p>{message}</p>

            {deployment?.qrCode && (

                <div>

                    <h2>Scan QR Code</h2>

                    <img
    src={qrImage}
    alt="WhatsApp QR"
    width={300}
/>

                </div>

            )}

            {deployment?.sessionReady && (

                <h2>
                    ✅ Bot Connected Successfully
                </h2>

            )}

        </div>

    );

}

export default Deploy;