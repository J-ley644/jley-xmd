export default function Dashboard({
deployments = [],
balance = 0
}) {


const connected =
    deployments.filter(
        d =>
            d.connectionStatus === "CONNECTED"
    ).length;


const running =
    deployments.filter(
        d =>
            d.status === "RUNNING"
    ).length;


const stopped =
    deployments.filter(
        d =>
            d.status === "STOPPED"
    ).length;


const pending =
    deployments.filter(
        d =>
            d.status === "PENDING"
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

    <section className="page-section">

        {/* HEADER */}

        <div className="page-header">

            <div>

                <h1>
                    ⚡ Dashboard
                </h1>

                <p>
                    Monitor your JLEY-XMD deployments
                    and wallet in real time.
                </p>

            </div>


            <div className="dashboard-live">

                <span className="live-dot" />

                Live

            </div>

        </div>


        {/* STATS */}

        <div className="stats-grid">

            <div className="stat-card">

                <span>
                    🤖
                </span>

                <h2>
                    {deployments.length}
                </h2>

                <p>
                    Total Deployments
                </p>

            </div>


            <div className="stat-card">

                <span>
                    💰
                </span>

                <h2>
                    {balance}
                </h2>

                <p>
                    JL Balance
                </p>

            </div>


            <div className="stat-card">

                <span>
                    🟢
                </span>

                <h2>
                    {connected}
                </h2>

                <p>
                    Connected
                </p>

            </div>


            <div className="stat-card">

                <span>
                    ⚡
                </span>

                <h2>
                    {running}
                </h2>

                <p>
                    Running
                </p>

            </div>

        </div>


        {/* SYSTEM OVERVIEW */}

        <div className="dashboard-card">

            <div className="card-header">

                <div>

                    <h2>
                        Deployment Overview
                    </h2>

                    <p>
                        Current state of your JLEY-XMD
                        bot deployments.
                    </p>

                </div>

            </div>


            <div className="overview-grid">

                <div className="overview-item">

                    <span>
                        🟢
                    </span>

                    <div>

                        <strong>
                            {connected}
                        </strong>

                        <small>
                            Connected
                        </small>

                    </div>

                </div>


                <div className="overview-item">

                    <span>
                        ⚡
                    </span>

                    <div>

                        <strong>
                            {running}
                        </strong>

                        <small>
                            Running
                        </small>

                    </div>

                </div>


                <div className="overview-item">

                    <span>
                        ⏳
                    </span>

                    <div>

                        <strong>
                            {pending}
                        </strong>

                        <small>
                            Pending
                        </small>

                    </div>

                </div>


                <div className="overview-item">

                    <span>
                        ⛔
                    </span>

                    <div>

                        <strong>
                            {stopped}
                        </strong>

                        <small>
                            Stopped
                        </small>

                    </div>

                </div>

            </div>

        </div>


        {/* RECENT DEPLOYMENTS */}

        <div className="dashboard-card">

            <div className="card-header">

                <div>

                    <h2>
                        Recent Deployments
                    </h2>

                    <p>
                        Your latest bot deployments.
                    </p>

                </div>

            </div>


            {
                recentDeployments.length === 0

                    ?

                    <div className="empty-state">

                        <div className="empty-icon">
                            🤖
                        </div>

                        <h3>
                            No deployments yet
                        </h3>

                        <p>
                            Create your first JLEY-XMD
                            deployment to get started.
                        </p>

                    </div>

                    :

                    <div className="recent-deployments">

                        {
                            recentDeployments.map(
                                deployment => (

                                    <div
                                        className="recent-deployment"
                                        key={deployment.id}
                                    >

                                        <div className="recent-bot">

                                            <div className="bot-icon">
                                                🤖
                                            </div>

                                            <div>

                                                <strong>
                                                    {
                                                        deployment.botName ||
                                                        "Unnamed Bot"
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        deployment.id
                                                            ? deployment.id.slice(0, 8)
                                                            : "—"
                                                    }
                                                </small>

                                            </div>

                                        </div>


                                        <div className="recent-status">

                                            <span
                                                className={`status ${getStatusClass(
                                                    deployment.status
                                                )}`}
                                            >
                                                {
                                                    deployment.connectionStatus ||
                                                    deployment.status ||
                                                    "OFFLINE"
                                                }
                                            </span>

                                        </div>


                                        <div className="recent-expiry">

                                            <small>
                                                Lifetime
                                            </small>

                                            <strong>
                                                {
                                                    getExpiry(
                                                        deployment
                                                    )
                                                }
                                            </strong>

                                        </div>


                                        <div className="recent-created">

                                            <small>
                                                Created
                                            </small>

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
                            )
                        }

                    </div>
            }

        </div>


        {/* QUICK INFORMATION */}

        <div className="dashboard-card">

            <div className="card-header">

                <div>

                    <h2>
                        Account Snapshot
                    </h2>

                    <p>
                        Your current JLEY-XMD resources.
                    </p>

                </div>

            </div>


            <div className="snapshot-grid">

                <div>

                    <span>
                        JL Credits
                    </span>

                    <strong>
                        {balance} JL
                    </strong>

                </div>


                <div>

                    <span>
                        Deployments
                    </span>

                    <strong>
                        {deployments.length}
                    </strong>

                </div>


                <div>

                    <span>
                        Active Bots
                    </span>

                    <strong>
                        {running}
                    </strong>

                </div>


                <div>

                    <span>
                        Connected
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
