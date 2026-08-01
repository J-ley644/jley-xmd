export default function Navbar({

    user,

    balance

}) {

    return (

        <header className="navbar">

            <div>

                <h2>

                    Welcome back,

                    {user?.name || "User"}

                    👋

                </h2>

                <p>

                    Manage your JLEY-XMD deployments

                </p>

            </div>

            <div className="navbar-right">

                <div className="wallet-chip">

                    💰 {balance ?? 0} JL

                </div>

                <button className="notify-btn">

                    🔔

                </button>

                <div className="avatar">

                    {user?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}

                </div>

            </div>

        </header>

    );

}