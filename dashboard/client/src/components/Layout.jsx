import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";

import "./Layout.css";


function Layout({ children }) {

    return (

        <div className="layout">

            <Sidebar />

            <div className="layout-main">

                <Navbar />

                <main className="layout-content">

                    {children}

                </main>

                <Footer />

            </div>

        </div>

    );

}


export default Layout;