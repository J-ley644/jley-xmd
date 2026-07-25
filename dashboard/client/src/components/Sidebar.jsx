import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {

    return (

        <aside className="sidebar">

            <div className="sidebar-logo">

                <div className="sidebar-icon">
                    J
                </div>

                <h2>JLEY-XMD</h2>

            </div>

            <nav>

                <NavLink to="/">
                    🏠 Dashboard
                </NavLink>

                <NavLink to="/deploy">
                    🚀 Deploy
                </NavLink>

                <NavLink to="/bots">
                    🤖 My Bots
                </NavLink>

                <NavLink to="/wallet">
                    💎 Wallet
                </NavLink>

                <NavLink to="/analytics">
                    📊 Analytics
                </NavLink>

                <NavLink to="/settings">
                    ⚙ Settings
                </NavLink>

            </nav>

        </aside>

    );

}

export default Sidebar;