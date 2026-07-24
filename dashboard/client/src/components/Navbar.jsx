import "./Navbar.css";

function Navbar() {

    return (

        <header className="navbar">

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

                <a href="/">Dashboard</a>

                <a href="/deploy">Deploy</a>

                <a href="/bots">Bots</a>

                <a href="/pricing">Pricing</a>

                <a href="/profile">Profile</a>

            </div>

        </header>

    );

}

export default Navbar;