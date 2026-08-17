export default function AdminNavbar({
    user,
    current
}) {

    const titles = {
        dashboard: "Admin Dashboard",
        users: "Users",
        deployments: "Deployments",
        "jl-economy": "JL Economy",
        payments: "Payments",
        engines: "Bot Engines",
        logs: "System Logs",
        settings: "System Settings"
    };

    return (
        <header className="admin-navbar">

            <div className="admin-navbar-title">

                <h1>
                    {titles[current] || "Admin Panel"}
                </h1>

                <p>
                    JLEY-XMD administration
                </p>

            </div>


            <div className="admin-navbar-user">

                <div className="admin-user-info">

                    <strong>
                        {user?.name || "Administrator"}
                    </strong>

                    <span>
                        {user?.email}
                    </span>

                </div>


                <div className="admin-role-badge">
                    ADMIN
                </div>

            </div>

        </header>
    );
}