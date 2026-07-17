import { Routes, Route } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/Dashboard";

import Login from "../pages/Login";


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


    </Routes>

  );

}


export default AppRoutes;