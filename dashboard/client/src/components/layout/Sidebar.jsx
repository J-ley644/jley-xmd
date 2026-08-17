export default function Sidebar({
    current,
    onChange,
    mobileOpen,
    onClose,
    onLogout,
    user
}) {

    const items = [

        ["dashboard", "🏠", "Dashboard"],
        ["deployments", "🤖", "Deployments"],
        ["pairing", "📱", "Pairing"],
        ["plugins", "🧩", "Plugins"],
        ["testing", "🧪", "Bot Testing"],
        ["logs", "📜", "Logs"],
        ["wallet", "💰", "Wallet"],
        ["updates", "🔔", "Updates"],
        ["settings", "⚙️", "Settings"]

    ];

    const isAdmin = user?.role === "ADMIN";


    return (

        <aside
            className={
                mobileOpen
                    ? "sidebar mobile-open"
                    : "sidebar"
            }
        >

            {/* LOGO */}

            <div className="logo">

                <span className="logo-icon">
                    ⚡
                </span>

                <span>
                    JLEY-XMD
                </span>

                <button
                    className="mobile-close-btn"
                    onClick={onClose}
                    aria-label="Close navigation"
                >
                    ✕
                </button>

            </div>


            {/* NAVIGATION */}

            <nav>

                {items.map(
                    ([id, icon, label]) => (

                        <button
                            key={id}
                            className={
                                current === id
                                    ? "nav-btn active"
                                    : "nav-btn"
                            }
                            onClick={() =>
                                onChange(id)
                            }
                        >

                            <span className="nav-icon">
                                {icon}
                            </span>

                            <span className="nav-label">
                                {label}
                            </span>

                        </button>

                    )
                )}


                {/* ADMIN */}

                {isAdmin && (

                    <>

                        <div
                            className="nav-section-label"
                        >
                            ADMIN
                        </div>


                        <button
                            className={
                                current === "admin"
                                    ? "nav-btn active"
                                    : "nav-btn"
                            }
                            onClick={() =>
                                onChange("admin")
                            }
                        >

                            <span className="nav-icon">
                                🛡️
                            </span>

                            <span className="nav-label">
                                Admin
                            </span>

                        </button>

                    </>

                )}

            </nav>


            {/* MOBILE LOGOUT */}

            <button
                className="sidebar-logout"
                onClick={onLogout}
            >
                🚪
                <span>
                    Logout
                </span>
            </button>


            <div className="sidebar-footer">

                Powered by

                <br />

                JLEY-XMD Engines

            </div>

        </aside>

    );

}