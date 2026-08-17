import { useEffect, useState } from "react";

import { apiGet } from "../../services/api";


export default function AdminDashboard({
    user
}) {

    const [stats, setStats] = useState({
        users: 0,
        deployments: 0,
        running: 0,
        jlIssued: 0
    });

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        loadStats();

    }, []);


    async function loadStats() {

        try {

            setLoading(true);

            setError("");


            /*
             * These endpoints will be added to the backend
             * as we build the admin API.
             *
             * For now, try the admin overview endpoint.
             */

            const data = await apiGet(
                "/api/admin/overview"
            );


            setStats({

                users:
                    data?.stats?.users ??
                    data?.users ??
                    0,

                deployments:
                    data?.stats?.deployments ??
                    data?.deployments ??
                    0,

                running:
                    data?.stats?.running ??
                    data?.running ??
                    0,

                jlIssued:
                    data?.stats?.jlIssued ??
                    data?.jlIssued ??
                    0

            });

        } catch (error) {

            console.error(
                "Admin dashboard error:",
                error
            );

            /*
             * The overview endpoint does not exist yet.
             * That is expected at this stage.
             */

            setError(
                error.message ||
                "Unable to load platform statistics."
            );

        } finally {

            setLoading(false);

        }

    }


    return (

        <section className="admin-page">

            <div className="admin-page-header">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user?.name || "Administrator"}
                        </strong>
                    </p>

                </div>

                <div className="admin-status">

                    <span className="status-dot" />

                    System Online

                </div>

            </div>


            {error && (

                <div className="admin-info-box">

                    <strong>
                        Admin API
                    </strong>

                    <p>
                        Platform statistics will appear
                        here once the admin overview API
                        is connected.
                    </p>

                </div>

            )}


            <div className="admin-stats-grid">

                <div className="admin-stat-card">

                    <span className="admin-stat-icon">
                        👥
                    </span>

                    <div>

                        <p>
                            Total Users
                        </p>

                        <h2>
                            {loading
                                ? "..."
                                : stats.users}
                        </h2>

                    </div>

                </div>


                <div className="admin-stat-card">

                    <span className="admin-stat-icon">
                        🤖
                    </span>

                    <div>

                        <p>
                            Deployments
                        </p>

                        <h2>
                            {loading
                                ? "..."
                                : stats.deployments}
                        </h2>

                    </div>

                </div>


                <div className="admin-stat-card">

                    <span className="admin-stat-icon">
                        🟢
                    </span>

                    <div>

                        <p>
                            Running Bots
                        </p>

                        <h2>
                            {loading
                                ? "..."
                                : stats.running}
                        </h2>

                    </div>

                </div>


                <div className="admin-stat-card">

                    <span className="admin-stat-icon">
                        💰
                    </span>

                    <div>

                        <p>
                            JL Issued
                        </p>

                        <h2>
                            {loading
                                ? "..."
                                : stats.jlIssued}
                        </h2>

                    </div>

                </div>

            </div>


            <div className="admin-dashboard-grid">

                <div className="admin-card">

                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Platform Control
                            </h2>

                            <p>
                                Manage your JLEY-XMD
                                infrastructure.
                            </p>

                        </div>

                    </div>


                    <div className="admin-control-list">

                        <div className="admin-control-item">

                            <span>
                                👥
                            </span>

                            <div>

                                <strong>
                                    Users
                                </strong>

                                <p>
                                    Manage client accounts
                                    and roles.
                                </p>

                            </div>

                        </div>


                        <div className="admin-control-item">

                            <span>
                                🤖
                            </span>

                            <div>

                                <strong>
                                    Deployments
                                </strong>

                                <p>
                                    Monitor deployed
                                    WhatsApp bots.
                                </p>

                            </div>

                        </div>


                        <div className="admin-control-item">

                            <span>
                                💰
                            </span>

                            <div>

                                <strong>
                                    JL Economy
                                </strong>

                                <p>
                                    Control JL pricing,
                                    deployment costs and
                                    bonuses.
                                </p>

                            </div>

                        </div>


                        <div className="admin-control-item">

                            <span>
                                ⚙️
                            </span>

                            <div>

                                <strong>
                                    Bot Engines
                                </strong>

                                <p>
                                    Manage the bot engine
                                    environment.
                                </p>

                            </div>

                        </div>

                    </div>

                </div>


                <div className="admin-card">

                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Administrator
                            </h2>

                            <p>
                                Current account
                            </p>

                        </div>

                    </div>


                    <div className="admin-profile">

                        <div className="admin-profile-avatar">
                            {(user?.name || "A")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>

                            <strong>
                                {user?.name ||
                                    "Administrator"}
                            </strong>

                            <p>
                                {user?.email}
                            </p>

                            <span>
                                ADMIN
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </section>

    );

}