export default function Dashboard({
    deployments = [],
    balance = 0
}) {

    const connected =
        deployments.filter(
            d => d.connectionStatus === "CONNECTED"
        ).length;

    const running =
        deployments.filter(
            d => d.status === "RUNNING"
        ).length;

    const stopped =
        deployments.filter(
            d => d.status === "STOPPED"
        ).length;

    const pending =
        deployments.filter(
            d => d.status === "PENDING"
        ).length;

    const recentDeployments =
        [...deployments]
            .sort(
                (a, b) =>
                    new Date(b.createdAt || 0) -
                    new Date(a.createdAt || 0)
            )
            .slice(0, 5);

    function getStatusClass(status) {
        if (status === "RUNNING") {
            return "connected";
        }

        if (status === "STOPPED") {
            return "offline";
        }

        return "pending";
    }

    function formatDate(date) {
        if (!date) {
            return "—";
        }

        return new Date(date).toLocaleString(
            undefined,
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    }

    function getExpiry(deployment) {
        if (!deployment.expiresAt) {
            return "Not activated";
        }

        const diff =
            new Date(
                deployment.expiresAt
            ).getTime() -
            Date.now();

        if (diff <= 0) {
            return "Expired";
        }

        const days =
            Math.ceil(
                diff /
                (1000 * 60 * 60 * 24)
            );

        return `${days} day${days === 1 ? "" : "s"} left`;
    }

    return (
        <section className="page-section dashboard-home">

            {/* HERO */}

            <div className="dashboard-hero">

                <div className="dashboard-hero-content">

                    <div className="dashboard-eyebrow">
                        JLEY-XMD CONTROL CENTER
                    </div>

                    <h1>
                        ⚡ Welcome to your dashboard
                    </h1>

                    <p>
                        Monitor your bots, deployments,
                        connections and JL resources
                        from one place.
                    </p>

                </div>

                <div className="dashboard-system-status">

                    <span className="dashboard-status-light"></span>

                    <div>
                        <strong>All systems operational</strong>
                        <small>JLEY-XMD Engine</small>
                    </div>

                </div>

            </div>


            {/* PRIMARY STATS */}

            <div className="dashboard-stats-grid">

                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-top">
                        <span className="dashboard-stat-icon">
                            🤖
                        </span>

                        <span className="dashboard-stat-label">
                            DEPLOYMENTS
                        </span>
                    </div>

                    <strong>
                        {deployments.length}
                    </strong>

                    <p>
                        Total bots
                    </p>

                </div>


                <div className="dashboard-stat-card wallet-stat">

                    <div className="dashboard-stat-top">
                        <span className="dashboard-stat-icon">
                            ◈
                        </span>

                        <span className="dashboard-stat-label">
                            JL WALLET
                        </span>
                    </div>

                    <strong>
                        {balance}
                    </strong>

                    <p>
                        Available JL credits
                    </p>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-top">
                        <span className="dashboard-stat-icon">
                            🟢
                        </span>

                        <span className="dashboard-stat-label">
                            CONNECTED
                        </span>
                    </div>

                    <strong>
                        {connected}
                    </strong>

                    <p>
                        WhatsApp accounts
                    </p>

                </div>


                <div className="dashboard-stat-card">

                    <div className="dashboard-stat-top">
                        <span className="dashboard-stat-icon">
                            ⚡
                        </span>

                        <span className="dashboard-stat-label">
                            RUNNING
                        </span>
                    </div>

                    <strong>
                        {running}
                    </strong>

                    <p>
                        Active engines
                    </p>

                </div>

            </div>


            {/* SYSTEM OVERVIEW */}

            <div className="dashboard-card dashboard-overview-card">

                <div className="dashboard-section-heading">

                    <div>

                        <div className="dashboard-card-kicker">
                            SYSTEM OVERVIEW
                        </div>

                        <h2>
                            Deployment health
                        </h2>

                        <p>
                            A quick look at the current
                            state of your bot infrastructure.
                        </p>

                    </div>

                    <div className="dashboard-overview-total">
                        <strong>
                            {deployments.length}
                        </strong>

                        <span>
                            total
                        </span>
                    </div>

                </div>


                <div className="dashboard-health-grid">

                    <div className="dashboard-health-item">

                        <div className="health-icon connected">
                            ✓
                        </div>

                        <div>
                            <strong>{connected}</strong>
                            <span>Connected</span>
                        </div>

                    </div>


                    <div className="dashboard-health-item">

                        <div className="health-icon running">
                            ⚡
                        </div>

                        <div>
                            <strong>{running}</strong>
                            <span>Running</span>
                        </div>

                    </div>


                    <div className="dashboard-health-item">

                        <div className="health-icon pending">
                            ◷
                        </div>

                        <div>
                            <strong>{pending}</strong>
                            <span>Pending</span>
                        </div>

                    </div>


                    <div className="dashboard-health-item">

                        <div className="health-icon stopped">
                            ×
                        </div>

                        <div>
                            <strong>{stopped}</strong>
                            <span>Stopped</span>
                        </div>

                    </div>

                </div>

            </div>


            {/* RECENT DEPLOYMENTS */}

            <div className="dashboard-card dashboard-recent-card">

                <div className="dashboard-section-heading">

                    <div>

                        <div className="dashboard-card-kicker">
                            ACTIVITY
                        </div>

                        <h2>
                            Recent deployments
                        </h2>

                        <p>
                            Your latest JLEY-XMD bot activity.
                        </p>

                    </div>

                    <div className="dashboard-live-pill">
                        <span></span>
                        Live
                    </div>

                </div>


                {recentDeployments.length === 0 ? (

                    <div className="dashboard-empty-state">

                        <div className="dashboard-empty-icon">
                            🤖
                        </div>

                        <h3>
                            No deployments yet
                        </h3>

                        <p>
                            Your newly created bots will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="dashboard-recent-list">

                        {recentDeployments.map(
                            deployment => (

                                <div
                                    className="dashboard-recent-row"
                                    key={deployment.id}
                                >

                                    <div className="dashboard-bot-avatar">
                                        🤖
                                    </div>


                                    <div className="dashboard-bot-details">

                                        <strong>
                                            {
                                                deployment.botName ||
                                                "Unnamed Bot"
                                            }
                                        </strong>

                                        <span>
                                            Deployment #
                                            {
                                                deployment.id
                                                    ? deployment.id.slice(0, 8)
                                                    : "—"
                                            }
                                        </span>

                                    </div>


                                    <div className="dashboard-row-status">

                                        <span
                                            className={`dashboard-status-tag ${getStatusClass(
                                                deployment.status
                                            )}`}
                                        >
                                            <i></i>

                                            {
                                                deployment.connectionStatus ||
                                                deployment.status ||
                                                "OFFLINE"
                                            }
                                        </span>

                                    </div>


                                    <div className="dashboard-row-expiry">

                                        <span>
                                            Lifetime
                                        </span>

                                        <strong>
                                            {
                                                getExpiry(
                                                    deployment
                                                )
                                            }
                                        </strong>

                                    </div>


                                    <div className="dashboard-row-created">

                                        <span>
                                            Created
                                        </span>

                                        <strong>
                                            {
                                                formatDate(
                                                    deployment.createdAt
                                                )
                                            }
                                        </strong>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>


            {/* ACCOUNT SNAPSHOT */}

            <div className="dashboard-card dashboard-snapshot-card">

                <div className="dashboard-section-heading">

                    <div>

                        <div className="dashboard-card-kicker">
                            ACCOUNT
                        </div>

                        <h2>
                            Resource snapshot
                        </h2>

                        <p>
                            Current resources available
                            to your account.
                        </p>

                    </div>

                </div>


                <div className="dashboard-resource-grid">

                    <div className="dashboard-resource">

                        <span>
                            JL Credits
                        </span>

                        <strong>
                            {balance} JL
                        </strong>

                    </div>


                    <div className="dashboard-resource">

                        <span>
                            Total Deployments
                        </span>

                        <strong>
                            {deployments.length}
                        </strong>

                    </div>


                    <div className="dashboard-resource">

                        <span>
                            Active Engines
                        </span>

                        <strong>
                            {running}
                        </strong>

                    </div>


                    <div className="dashboard-resource">

                        <span>
                            WhatsApp Connections
                        </span>

                        <strong>
                            {connected}
                        </strong>

                    </div>

                </div>

            </div>

        </section>
    );
}