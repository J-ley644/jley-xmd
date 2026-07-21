import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Deploy from "../pages/Deploy";


function AppRoutes(){

    return (

        <Routes>


            <Route

                path="/"

                element={<Home />}

            />


            <Route

                path="/deploy"

                element={<Deploy />}

            />


        </Routes>

    );

}


export default AppRoutes;