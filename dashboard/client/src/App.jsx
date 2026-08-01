import { useEffect, useState } from "react";

import {
    apiGet,
    apiPost,
    saveToken,
    getToken,
    clearToken
} from "./services/api";

import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Deployments from "./pages/Deployments";


function App() {


    const [mode, setMode] = useState("login");

    const [user, setUser] = useState(null);


    const [page, setPage] = useState("dashboard");


    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [botName, setBotName] = useState("");


    const [balance, setBalance] = useState(0);

    const [deployments, setDeployments] = useState([]);


    const [pairingId, setPairingId] = useState(null);

    const [qr, setQr] = useState(null);


    const [loading, setLoading] = useState(false);

    const [deploying, setDeploying] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");



    useEffect(() => {

        const token = getToken();

        if (!token) return;

        loadDashboard();

    }, []);




    useEffect(() => {

        if (!pairingId) return;


        const interval = setInterval(async () => {

            try {

                const data =
                    await apiGet(
                        `/api/pairing/${pairingId}/status`
                    );


                if (data.qr) {

                    setQr(data.qr);

                }


                if (data.status === "connected") {


                    setMessage(
                        "WhatsApp connected successfully."
                    );


                    setQr(null);

                    setPairingId(null);


                    await loadDeployments();

                }


            } catch(error) {

                console.error(
                    "Pairing polling error:",
                    error
                );

            }


        },2000);



        return () =>
            clearInterval(interval);


    },[pairingId]);





    async function loadDashboard(){

        try {


            const me =
                await apiGet(
                    "/api/auth/me"
                );


            setUser(me.user);



            await Promise.all([

                loadWallet(),

                loadDeployments()

            ]);



        } catch(error){


            clearToken();

            setUser(null);


        }

    }




    async function loadWallet(){

        try {


            const data =
                await apiGet(
                    "/api/wallet"
                );


            setBalance(
                data.balance ?? 0
            );


        } catch(error){

            console.error(
                "Wallet error:",
                error
            );

        }

    }





    async function loadDeployments(){

        try {


            const data =
                await apiGet(
                    "/api/deployments"
                );


            setDeployments(
                data.deployments || data
            );


        } catch(error){


            console.error(
                "Deployment error:",
                error
            );


        }

    }





    async function login(){

        setLoading(true);

        setError("");


        try{


            const data =
                await apiPost(
                    "/api/auth/login",
                    {
                        email,
                        password
                    }
                );


            saveToken(
                data.token
            );


            await loadDashboard();



        }catch(error){


            setError(
                error.message ||
                "Login failed."
            );


        }


        setLoading(false);


    }





    async function register(){


        setLoading(true);

        setError("");



        try{


            await apiPost(
                "/api/auth/register",
                {
                    name,
                    email,
                    password
                }
            );


            setMessage(
                "Account created successfully."
            );


            setMode("login");



        }catch(error){


            setError(
                error.message ||
                "Registration failed."
            );


        }


        setLoading(false);


    }





    function logout(){

        clearToken();

        setUser(null);

        setDeployments([]);

        setBalance(0);

        setPage("dashboard");

    }





    async function deployBot(){


        if(!botName.trim()) return;


        setDeploying(true);



        try{


            await apiPost(
                "/api/deployments",
                {
                    botName
                }
            );


            setBotName("");


            await loadDeployments();

            await loadWallet();



        }catch(error){


            setError(
                error.message ||
                "Deployment failed."
            );


        }


        setDeploying(false);


    }







    async function pairBot(id){


        try{


            const data =
                await apiPost(
                    `/api/pairing/${id}/start`
                );



            setPairingId(id);



            if(data.qr){

                setQr(data.qr);

            }



        }catch(error){


            setError(
                error.message ||
                "Pairing failed."
            );


        }


    }







    async function pairPhone(id){


        const phoneNumber =
            prompt(
                "Enter WhatsApp number with country code"
            );



        if(!phoneNumber) return;



        try{


            const data =
                await apiPost(
                    `/api/pairing/${id}/code`,
                    {
                        phoneNumber
                    }
                );



            setMessage(
                `Your WhatsApp pairing code: ${data.code}`
            );



        }catch(error){


            setError(
                error.message ||
                "Phone pairing failed."
            );


        }


    }







    async function stopBot(id){


        try{


            await apiPost(
                `/api/deployments/${id}/stop`
            );


            await loadDeployments();



        }catch(error){


            setError(
                error.message ||
                "Failed to stop bot."
            );


        }


    }






    if(!user){


        return (

            <div className="auth-container">

                <div className="auth-card">


                    <h1>
                        JLEY-XMD
                    </h1>


                    <p>

                        {
                            mode === "login"
                            ? "Sign in to continue"
                            : "Create your account"
                        }

                    </p>



                    {error && (

                        <div className="error-box">

                            {error}

                        </div>

                    )}



                    {message && (

                        <div className="success-box">

                            {message}

                        </div>

                    )}





                    {
                        mode === "login"

                        ?

                        <>


                        <input
                            placeholder="Email"
                            value={email}
                            onChange={
                                e=>setEmail(e.target.value)
                            }
                        />


                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={
                                e=>setPassword(e.target.value)
                            }
                        />


                        <button
                            onClick={login}
                            disabled={loading}
                        >
                            Login
                        </button>



                        <button
                            className="link-button"
                            onClick={() =>
                                setMode("register")
                            }
                        >
                            Create account
                        </button>


                        </>


                        :


                        <>

                        <input
                            placeholder="Full Name"
                            value={name}
                            onChange={
                                e=>setName(e.target.value)
                            }
                        />


                        <input
                            placeholder="Email"
                            value={email}
                            onChange={
                                e=>setEmail(e.target.value)
                            }
                        />


                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={
                                e=>setPassword(e.target.value)
                            }
                        />


                        <button
                            onClick={register}
                            disabled={loading}
                        >
                            Register
                        </button>


                        <button
                            className="link-button"
                            onClick={() =>
                                setMode("login")
                            }
                        >
                            Back to login
                        </button>


                        </>

                    }


                </div>

            </div>

        );


    }





    return (

        <DashboardLayout

            user={user}

            balance={balance}

            current={page}

            onNavigate={setPage}

        >


            {

                page === "dashboard"


                ?


                <Dashboard

                    deployments={deployments}

                    balance={balance}

                />


                :


                <Deployments

    deployments={deployments}

    onPair={pairBot}

    onPairCode={pairPhone}

    onStop={stopBot}

    botName={botName}

    setBotName={setBotName}

    deployBot={deployBot}

    deploying={deploying}

/>


            }


        </DashboardLayout>


    );


}


export default App;