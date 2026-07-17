import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="dashboard-container">

      <Sidebar />

      <div className="dashboard-main">

        <Navbar />

        <main className="dashboard-content">
          {children}
        </main>

      </div>

    </div>
  );
}

export default DashboardLayout;