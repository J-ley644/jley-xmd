
import { useEffect, useState } from "react";

import Hero from "../components/Hero";
import Stats from "../components/Stats";
import DeploymentCard from "../components/DeploymentCard";
import { apiRequest } from "../services/api";


function Home() {

    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        async function loadDashboard() {

            try {

                const response =
                    await apiRequest(
                        "/api/client/dashboard"
                    );


                setDashboard(response);


            } catch (error) {

                console.error(
                    "CLIENT DASHBOARD ERROR:",
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

            <div className="dashboard-loading">

                <h2>
                    Loading dashboard...
                </h2>

                <p>
                    Fetching your JLEY-XMD account data.
                </p>

            </div>

        );

    }


    if (error) {

        return (

            <div className="dashboard-error">

                <h2>
                    Unable to load dashboard
                </h2>

                <p>
                    {error}
                </p>

            </div>

        );

    }


    const stats =
        dashboard?.stats || {};


    const deployments =
        dashboard?.deployments || [];


    return (

        <>

            <Hero />

            <Stats
                stats={stats}
            />


            <section className="client-deployments">

                <div className="client-section-header">

                    <div>

                        <span className="client-section-eyebrow">
                            YOUR BOTS
                        </span>

                        <h2>
                            Deployments
                        </h2>

                        <p>
                            Monitor and manage your deployed JLEY-XMD bots.
                        </p>

                    </div>

                    <div className="deployment-count">

                        {deployments.length}{" "}

                        {deployments.length === 1
                            ? "Deployment"
                            : "Deployments"
                        }

                    </div>

                </div>


                {deployments.length === 0 ? (

                    <div className="empty-deployments">

                        <div className="empty-deployment-icon">
                            🤖
                        </div>

                        <h3>
                            No deployments yet
                        </h3>

                        <p>
                            Deploy your first JLEY-XMD bot to see it here.
                        </p>

                    </div>

                ) : (

                    <div className="deployment-grid">

                        {deployments.map(
                            (deployment) => (

                                <DeploymentCard
                                    key={deployment.id}
                                    deployment={deployment}
                                />

                            )
                        )}

                    </div>

                )}

            </section>

        </>

    );

}


export default Home;

