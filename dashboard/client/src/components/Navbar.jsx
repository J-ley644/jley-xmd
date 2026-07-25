import "./Navbar.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import MobileSidebar from "./MobileSidebar";

function Navbar() {

    const [open, setOpen] = useState(false);

    return (

        <>

            <header className="navbar">

                <button
                    className="menu-btn"
                    onClick={() => setOpen(true)}
                >
                    ☰
                </button>

                <div className="logo">

                    <div className="logo-icon">
                        J
                    </div>

                    <div>

                        <h2>JLEY-XMD</h2>

                        <p>WhatsApp Automation Platform</p>

                    </div>

                </div>

                <div className="nav-links">

                    <NavLink to="/">
                        Dashboard
                    </NavLink>

                    <NavLink to="/deploy">
                        Deploy
                    </NavLink>

                    <NavLink to="/bots">
                        Bots
                    </NavLink>

                    <NavLink to="/pricing">
                        Pricing
                    </NavLink>

                    <NavLink to="/profile">
                        Profile
                    </NavLink>

                </div>

            </header>

            <MobileSidebar
                open={open}
                setOpen={setOpen}
            />

        </>

    );

}

export default Navbar;