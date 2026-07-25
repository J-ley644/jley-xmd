import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AppRoutes from "../routes/AppRoutes";

import "./Layout.css";

function Layout() {
    return (
        <div className="layout">

            <Sidebar />

            <div className="layout-main">

                <Navbar />

                <main className="layout-content">
                    <AppRoutes />
                </main>

                <Footer />

            </div>

        </div>
    );
}

export default Layout;