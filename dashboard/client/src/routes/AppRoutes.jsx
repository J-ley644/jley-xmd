import { Routes, Route, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Deploy from "../pages/Deploy";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Layout from "../components/Layout";


function ProtectedRoute({ children }) {

    const token = localStorage.getItem("token");

    if (!token) {

        return <Navigate to="/login" replace />;

    }

    return children;

}


function DashboardLayout({ children }) {

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
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* PROTECTED DASHBOARD */}

            <Route
                path="/"
                element={
                    <DashboardLayout>
                        <Home />
                    </DashboardLayout>
                }
            />

            <Route
                path="/deploy"
                element={
                    <DashboardLayout>
                        <Deploy />
                    </DashboardLayout>
                }
            />


            {/* UNKNOWN */}

            <Route
                path="*"
                element={<Navigate to="/" replace />}
            />

        </Routes>

    );

}


export default AppRoutes;