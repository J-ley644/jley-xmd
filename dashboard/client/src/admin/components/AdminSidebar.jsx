export default function AdminSidebar({
    current,
    onChange,
    onLogout
}) {

    const items = [
        ["dashboard", "📊", "Dashboard"],
        ["users", "👥", "Users"],
        ["deployments", "🤖", "Deployments"],
        ["jl-economy", "💰", "JL Economy"],
        ["payments", "💳", "Payments"],
        ["engines", "⚙️", "Bot Engines"],
        ["logs", "📜", "Logs"],
        ["settings", "🔧", "System Settings"]
    ];

    return (
        <aside className="admin-sidebar">

            <div className="admin-logo">

                <span className="admin-logo-icon">
                    ⚡
                </span>

                <div>
                    <strong>JLEY-XMD</strong>
                    <small>ADMIN PANEL</small>
                </div>

            </div>

            <nav className="admin-nav">

                {items.map(([id, icon, label]) => (

                    <button
                        key={id}
                        className={
                            current === id
                                ? "admin-nav-btn active"
                                : "admin-nav-btn"
                        }
                        onClick={() => onChange(id)}
                    >

                        <span className="admin-nav-icon">
                            {icon}
                        </span>

                        <span>
                            {label}
                        </span>

                    </button>

                ))}

            </nav>

            <div className="admin-sidebar-bottom">

                <button
                    className="admin-logout"
                    onClick={onLogout}
                >
                    🚪 Logout
                </button>

                <div className="admin-version">
                    JLEY-XMD Admin
                    <br />
                    v2.1.0
                </div>

            </div>

        </aside>
    );
}