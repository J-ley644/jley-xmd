import { Routes, Route } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Dashboard from "../pages/Dashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default AppRoutes;