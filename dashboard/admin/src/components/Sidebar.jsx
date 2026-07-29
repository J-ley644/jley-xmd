import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    function logout() {

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");
        localStorage.removeItem("adminUser");

        navigate("/login", {
            replace: true
        });

    }

    return (

        <aside className="admin-sidebar">

            <div className="admin-brand">

                <div className="admin-brand-icon">
                    J
                </div>

                <div>
                    <h2>JLEY-XMD</h2>
                    <span>ADMIN</span>
                </div>

            </div>

            <nav className="admin-nav">

                <NavLink to="/">
                    Dashboard
                </NavLink>

                <NavLink to="/clients">
                    Clients
                </NavLink>

            </nav>

            <button
                className="admin-logout"
                onClick={logout}
            >
                Logout
            </button>

        </aside>

    );

}

export default Sidebar;
