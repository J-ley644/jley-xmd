import {
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import AdminLayout from "./components/AdminLayout";


function ProtectedRoute({ children }) {

    const token =
        localStorage.getItem("adminToken");

    const role =
        localStorage.getItem("adminRole");

    if (!token || role !== "ADMIN") {

        return (
            <Navigate
                to="/login"
                replace
            />
        );

    }

    return children;

}


function ProtectedAdminPage({ children }) {

    return (

        <ProtectedRoute>

            <AdminLayout>

                {children}

            </AdminLayout>

        </ProtectedRoute>

    );

}


function App() {

    return (

        <Routes>

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/"
                element={
                    <ProtectedAdminPage>
                        <Dashboard />
                    </ProtectedAdminPage>
                }
            />

            <Route
                path="/clients"
                element={
                    <ProtectedAdminPage>
                        <Clients />
                    </ProtectedAdminPage>
                }
            />

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


export default App;
