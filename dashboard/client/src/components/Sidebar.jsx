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

                <a href="/">🏠 Dashboard</a>

                <a href="/deploy">🚀 Deploy</a>

                <a href="/bots">🤖 My Bots</a>

                <a href="/wallet">💎 Wallet</a>

                <a href="/analytics">📊 Analytics</a>

                <a href="/settings">⚙ Settings</a>

            </nav>

        </aside>

    );

}

export default Sidebar;