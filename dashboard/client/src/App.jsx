import "./App.css";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer";

function App() {

    return (

        <div className="app-shell">

            <div className="animated-bg">

                <span className="blob blob1"></span>
                <span className="blob blob2"></span>
                <span className="blob blob3"></span>

            </div>


            <Sidebar />


            <div className="main-content">

                <Navbar />

                <div className="page-content">

                    <AppRoutes />

                </div>


                <Footer />


            </div>


        </div>

    );

}

export default App;