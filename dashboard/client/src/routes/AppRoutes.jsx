import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard";

import Login from "../pages/Login";
import Deployments from "../pages/Deployments";


function AppRoutes() {


  return (

    <Routes>


      <Route

        path="/login"

        element={<Login />}

      />



      <Route

        path="/"

        element={

          <DashboardLayout>

            <Dashboard />

          </DashboardLayout>

        }

      />

      <Route
    path="/deployments"
    element={
        <DashboardLayout>
            <Deployments />
        </DashboardLayout>
    }
/>


    </Routes>

  );

}


export default AppRoutes;