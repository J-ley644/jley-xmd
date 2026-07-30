
import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import { useEffect, useState } from "react";

import Home from "../pages/Home";
import Deploy from "../pages/Deploy";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Layout from "../components/Layout";
import { apiRequest } from "../services/api";


function ProtectedRoute({ children }) {

    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);


    useEffect(() => {

        let mounted = true;


        async function verifySession() {

            const token =
                localStorage.getItem("token");


            if (!token) {

                if (mounted) {

                    setAuthenticated(false);
                    setChecking(false);

                }

                return;

            }


            try {

                await apiRequest(
                    "/api/auth/me"
                );


                if (mounted) {

                    setAuthenticated(true);
                    setChecking(false);

                }


            } catch (error) {

                console.error(
                    "AUTH SESSION CHECK FAILED:",
                    error
                );


                localStorage.removeItem("token");


                if (mounted) {

                    setAuthenticated(false);
                    setChecking(false);

                }

            }

        }


        verifySession();


        return () => {

            mounted = false;

        };

    }, []);


    if (checking) {

        return (

            <div className="dashboard-loading">

                <h2>
                    Checking your session...
                </h2>

                <p>
                    Please wait.
                </p>

            </div>

        );

    }


    if (!authenticated) {

        return (

            <Navigate
                to="/login"
                replace
            />

        );

    }


    return children;

}


function DashboardLayout({ children }) {

    return (

        <Layout>

            {children}

        </Layout>

    );

}


function ProtectedDashboardLayout({ children }) {

    return (

        <ProtectedRoute>

            <Layout>

                {children}

            </Layout>

        </ProtectedRoute>

    );

}


function AppRoutes() {

    return (

        <Routes>

            {/* PUBLIC */}

            <Route
                path="/"
                element={
                    <DashboardLayout>
                        <Home />
                    </DashboardLayout>
                }
            />


            <Route
                path="/login"
                element={<Login />}
            />


            <Route
                path="/register"
                element={<Register />}
            />


            {/* ACCOUNT REQUIRED */}

            <Route
                path="/deploy"
                element={
                    <ProtectedDashboardLayout>
                        <Deploy />
                    </ProtectedDashboardLayout>
                }
            />


            {/* UNKNOWN */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>

    );

}


export default AppRoutes;
