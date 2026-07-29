import { useEffect, useState } from "react";
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

                setStats(
                    response.stats || {}
                );

            } catch (error) {

                console.error(
                    "ADMIN DASHBOARD ERROR:",
                    error
                );

                setError(
                    error.message ||
                    "Failed to load dashboard."
                );

            } finally {

                setLoading(false);

            }

        }

        loadDashboard();

    }, []);

    if (loading) {

        return (
            <div className="admin-page">
                <h1>Admin Dashboard</h1>
                <p>Loading dashboard...</p>
            </div>
        );

    }

    if (error) {

        return (
            <div className="admin-page">

                <h1>Admin Dashboard</h1>

                <div className="admin-error">
                    {error}
                </div>

            </div>
        );

    }

    return (

        <div className="admin-page">

            <div className="page-header">

                <div>
                    <h1>Admin Dashboard</h1>

                    <p>
                        JLEY-XMD platform overview
                    </p>
                </div>

            </div>

            <div className="stats-grid">

                <Stat
                    title="Total Clients"
                    value={stats?.totalClients ?? 0}
                />

                <Stat
                    title="Total Deployments"
                    value={stats?.totalDeployments ?? 0}
                />

                <Stat
                    title="Running Deployments"
                    value={stats?.runningDeployments ?? 0}
                />

                <Stat
                    title="Pending Deployments"
                    value={stats?.pendingDeployments ?? 0}
                />

                <Stat
                    title="Stopped Deployments"
                    value={stats?.stoppedDeployments ?? 0}
                />

                <Stat
                    title="Failed Deployments"
                    value={stats?.failedDeployments ?? 0}
                />

                <Stat
                    title="Total Payments"
                    value={stats?.totalPayments ?? 0}
                />

                <Stat
                    title="Successful Payments"
                    value={stats?.successfulPayments ?? 0}
                />

                <Stat
                    title="JL Wallet Balance"
                    value={`${stats?.totalJLBalance ?? 0} JL`}
                />

            </div>

        </div>

    );

}

function Stat({ title, value }) {

    return (

        <div className="stat-card">

            <p>{title}</p>

            <h2>{value}</h2>

        </div>

    );

}

export default Dashboard;
