import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function AdminLayout({ children }) {

    return (

        <div className="admin-layout">

            <Sidebar />

            <div className="admin-main">

                <Navbar />

                <main className="admin-content">

                    {children}

                </main>

            </div>

        </div>

    );

}

export default AdminLayout;
