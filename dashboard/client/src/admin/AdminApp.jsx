import { useEffect, useState } from "react";

import {
    apiGet,
    clearToken,
    getToken
} from "../services/api";

import AdminLayout from "./components/AdminLayout";

import AdminDashboard from "./pages/AdminDashboard";
import Users from "./pages/Users";
import AdminDeployments from "./pages/AdminDeployments";
import JLEconomy from "./pages/JLEconomy";
import Payments from "./pages/Payments";
import BotEngines from "./pages/BotEngines";
import AdminLogs from "./pages/AdminLogs";
import SystemSettings from "./pages/SystemSettings";


export default function AdminApp({
    onLogout
}) {

    const [user, setUser] = useState(null);

    const [page, setPage] = useState(
        "dashboard"
    );

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        loadAdmin();

    }, []);


    async function loadAdmin() {

        const token = getToken();

        if (!token) {

            onLogout();

            return;

        }


        try {

            const data = await apiGet(
                "/api/auth/me"
            );

            const currentUser =
                data?.user;


            if (!currentUser) {

                throw new Error(
                    "Unable to load administrator."
                );

            }


            if (
                currentUser.role !==
                "ADMIN"
            ) {

                throw new Error(
                    "Admin access required."
                );

            }


            setUser(currentUser);

        } catch (error) {

            console.error(
                "Admin authentication error:",
                error
            );

            setError(
                error.message ||
                "Admin authentication failed."
            );

            clearToken();

        } finally {

            setLoading(false);

        }

    }


    function logout() {

        clearToken();

        setUser(null);

        onLogout();

    }


    if (loading) {

        return (
            <div className="admin-loading">

                <h2>
                    JLEY-XMD
                </h2>

                <p>
                    Loading admin panel...
                </p>

            </div>
        );

    }


    if (error || !user) {

        return (
            <div className="admin-access-denied">

                <div className="admin-access-card">

                    <h1>
                        Admin Access
                    </h1>

                    <p>
                        {error ||
                            "Administrator authentication required."}
                    </p>

                    <button
                        onClick={onLogout}
                    >
                        Return to Login
                    </button>

                </div>

            </div>
        );

    }


    function renderPage() {

        switch (page) {

            case "dashboard":

                return (
                    <AdminDashboard
                        user={user}
                    />
                );


            case "users":

                return (
                    <Users />
                );


            case "deployments":

                return (
                    <AdminDeployments />
                );


            case "jl-economy":

                return (
                    <JLEconomy />
                );


            case "payments":

                return (
                    <Payments />
                );


            case "engines":

                return (
                    <BotEngines />
                );


            case "logs":

                return (
                    <AdminLogs />
                );


            case "settings":

                return (
                    <SystemSettings />
                );


            default:

                return (
                    <AdminDashboard
                        user={user}
                    />
                );

        }

    }


    return (

        <AdminLayout
            user={user}
            current={page}
            onNavigate={setPage}
            onLogout={logout}
        >

            {renderPage()}

        </AdminLayout>

    );

}