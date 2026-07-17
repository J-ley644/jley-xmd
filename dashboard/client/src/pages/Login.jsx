import { useState } from "react";
import { apiRequest } from "../services/api";
import { useNavigate } from "react-router-dom";


function Login(){

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const navigate = useNavigate();



    async function handleLogin(e){

        e.preventDefault();


        try {

            const response = await apiRequest(
                "/api/auth/login",
                {
                    method: "POST",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            localStorage.setItem(
                "token",
                response.token
            );


            navigate("/");


        } catch(error) {

            console.log(error);

            alert("Login failed");

        }

    }



    return (

        <div className="dashboard-content">


            <h1>
                JLEY-XMD Login
            </h1>



            <form onSubmit={handleLogin}>


                <input

                    type="email"

                    placeholder="Email"

                    value={email}

                    onChange={
                        e => setEmail(e.target.value)
                    }

                />



                <input

                    type="password"

                    placeholder="Password"

                    value={password}

                    onChange={
                        e => setPassword(e.target.value)
                    }

                />



                <button type="submit">

                    Login

                </button>


            </form>


        </div>

    );

}


export default Login;