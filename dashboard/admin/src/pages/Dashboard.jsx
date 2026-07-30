
import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import { getAdminDashboard } from "../services/api";

function Dashboard() {

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadDashboard() {

            try {

                const response =
                    await getAdminDashboard();

                setStats(response.stats);

            } catch (err) {

                console.error(
                    "ADMIN DASHBOARD ERROR:",
                    err
                );

                setError(
                    err.message ||
                    "Unable to load dashboard."
                );

            } finally {

                setLoading(false);

            }

        }

        loadDashboard();

    }, []);


    if (loading) {

        return (

            <div className="admin-loading">

                <div className="loading-spinner"></div>

                <p>
                    Loading administration centre...
                </p>

            </div>

        );

    }


    if (error) {

        return (

            <div className="admin-error">

                <div className="error-icon">
                    !
                </div>

                <div>

                    <strong>
                        Dashboard unavailable
                    </strong>

                    <p>
                        {error}
                    </p>

                </div>

            </div>

        );

    }


    const deploymentTotal =
        stats.totalDeployments || 0;

    const runningPercentage =
        deploymentTotal > 0
            ? Math.round(
                (stats.runningDeployments /
                    deploymentTotal) * 100
            )
            : 0;


    return (

        <>

            <section className="dashboard-header">

                <div>

                    <span className="eyebrow">
                        PLATFORM OVERVIEW
                    </span>

                    <h2>
                        Good to see you, Administrator.
                    </h2>

                    <p>
                        Monitor clients, deployments,
                        payments and JL activity from
                        one central control centre.
                    </p>

                </div>

                <div className="system-status">

                    <span className="status-dot"></span>

                    <span>
                        System operational
                    </span>

                </div>

            </section>


            <section className="stats-grid">

                <StatCard
                    title="Total Clients"
                    value={stats.totalClients}
                    icon="◎"
                    description="Registered client accounts"
                />

                <StatCard
                    title="Deployments"
                    value={stats.totalDeployments}
                    icon="◈"
                    description="Total bot deployments"
                />

                <StatCard
                    title="Running Bots"
                    value={stats.runningDeployments}
                    icon="●"
                    description={`${runningPercentage}% of deployments active`}
                />

                <StatCard
                    title="JL Wallet"
                    value={`${stats.totalJLBalance} JL`}
                    icon="◇"
                    description="Combined client balance"
                />

            </section>


            <section className="dashboard-grid">

                <div className="admin-panel deployment-panel">

                    <div className="panel-heading">

                        <div>

                            <span className="panel-label">
                                DEPLOYMENT HEALTH
                            </span>

                            <h3>
                                Deployment overview
                            </h3>

                        </div>

                        <span className="panel-live">
                            LIVE
                        </span>

                    </div>


                    <div className="deployment-overview">

                        <div
                            className="health-ring"
                            style={{
                                "--health": runningPercentage
                            }}
                        >

                            <div className="health-ring-inner">

                                <strong>
                                    {runningPercentage}%
                                </strong>

                                <span>
                                    Running
                                </span>

                            </div>

                        </div>


                        <div className="deployment-list">

                            <div className="deployment-row">

                                <span>
                                    <i className="indicator running"></i>
                                    Running
                                </span>

                                <strong>
                                    {stats.runningDeployments}
                                </strong>

                            </div>


                            <div className="deployment-row">

                                <span>
                                    <i className="indicator pending"></i>
                                    Pending
                                </span>

                                <strong>
                                    {stats.pendingDeployments}
                                </strong>

                            </div>


                            <div className="deployment-row">

                                <span>
                                    <i className="indicator stopped"></i>
                                    Stopped
                                </span>

                                <strong>
                                    {stats.stoppedDeployments}
                                </strong>

                            </div>


                            <div className="deployment-row">

                                <span>
                                    <i className="indicator failed"></i>
                                    Failed
                                </span>

                                <strong>
                                    {stats.failedDeployments}
                                </strong>

                            </div>

                        </div>

                    </div>

                </div>


                <div className="admin-panel platform-panel">

                    <div className="panel-heading">

                        <div>

                            <span className="panel-label">
                                PLATFORM ACTIVITY
                            </span>

                            <h3>
                                Payments
                            </h3>

                        </div>

                        <span className="activity-icon">
                            ↗
                        </span>

                    </div>


                    <div className="payment-summary">

                        <div>

                            <span>
                                Total payments
                            </span>

                            <strong>
                                {stats.totalPayments}
                            </strong>

                        </div>


                        <div>

                            <span>
                                Successful
                            </span>

                            <strong className="success-text">
                                {stats.successfulPayments}
                            </strong>

                        </div>

                    </div>


                    <div className="payment-progress">

                        <div className="progress-track">

                            <div
                                className="progress-value"
                                style={{
                                    width:
                                        stats.totalPayments > 0
                                            ? `${Math.round(
                                                (stats.successfulPayments /
                                                    stats.totalPayments) *
                                                100
                                            )}%`
                                            : "0%"
                                }}
                            ></div>

                        </div>

                        <span>
                            {stats.totalPayments > 0
                                ? Math.round(
                                    (stats.successfulPayments /
                                        stats.totalPayments) *
                                    100
                                )
                                : 0
                            }% success rate
                        </span>

                    </div>


                    <div className="platform-note">

                        <span className="note-icon">
                            ✓
                        </span>

                        <p>
                            Payment monitoring is active
                            across the platform.
                        </p>

                    </div>

                </div>

            </section>


            <section className="admin-panel quick-panel">

                <div>

                    <span className="panel-label">
                        ADMINISTRATION
                    </span>

                    <h3>
                        Control centre
                    </h3>

                    <p>
                        Use the administration tools to
                        monitor clients and platform
                        activity.
                    </p>

                </div>


                <div className="quick-actions">

                    <a href="/clients">

                        <span>◎</span>

                        Manage clients

                        <b>→</b>

                    </a>

                </div>

            </section>

        </>

    );

}

export default Dashboard;
