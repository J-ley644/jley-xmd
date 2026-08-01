export default function Sidebar({

    current,

    onChange

}) {

    const items = [

        ["dashboard", "🏠", "Dashboard"],

        ["deployments", "🤖", "Deployments"],

        ["wallet", "💰", "Wallet"],

        ["pairing", "📱", "Pairing"],

        ["settings", "⚙️", "Settings"]

    ];

    return (

        <aside className="sidebar">

            <div className="logo">

                <span className="logo-icon">⚡</span>

                <span>JLEY-XMD</span>

            </div>

            <nav>

                {

                    items.map(

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

                                <span>{icon}</span>

                                <span>{label}</span>

                            </button>

                        )

                    )

                }

            </nav>

            <div className="sidebar-footer">

                Powered by

                <br />

                JLEY-XMD Engines

            </div>

        </aside>

    );

}