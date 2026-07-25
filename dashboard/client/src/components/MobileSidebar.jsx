import { NavLink } from "react-router-dom";
import "./MobileSidebar.css";

function MobileSidebar({ open, setOpen }) {

    return (

        <>

            <div
                className={`mobile-overlay ${open ? "show" : ""}`}
                onClick={() => setOpen(false)}
            ></div>

            <aside className={`mobile-sidebar ${open ? "open" : ""}`}>

                <div className="mobile-header">

                    <h2>JLEY-XMD</h2>

                    <button onClick={() => setOpen(false)}>
                        ✕
                    </button>

                </div>

                <nav>

                    <NavLink to="/" onClick={() => setOpen(false)}>
                        🏠 Dashboard
                    </NavLink>

                    <NavLink to="/deploy" onClick={() => setOpen(false)}>
                        🚀 Deploy
                    </NavLink>

                    <NavLink to="/bots" onClick={() => setOpen(false)}>
                        🤖 My Bots
                    </NavLink>

                    <NavLink to="/wallet" onClick={() => setOpen(false)}>
                        💎 Wallet
                    </NavLink>

                    <NavLink to="/analytics" onClick={() => setOpen(false)}>
                        📊 Analytics
                    </NavLink>

                    <NavLink to="/settings" onClick={() => setOpen(false)}>
                        ⚙ Settings
                    </NavLink>

                </nav>

            </aside>

        </>

    );

}

export default MobileSidebar;