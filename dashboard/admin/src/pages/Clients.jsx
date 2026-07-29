import { useEffect, useState } from "react";
import { getAdminClients } from "../services/api";

function Clients() {

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {

        async function loadClients() {

            try {

                const response = await getAdminClients();

                setClients(response.clients || []);

            } catch (error) {

                console.error("CLIENTS ERROR:", error);

                setError(
                    error.message ||
                    "Failed to load clients."
                );

            } finally {

                setLoading(false);

            }

        }

        loadClients();

    }, []);

    if (loading) {

        return (
            <div className="admin-page">
                <h1>Clients</h1>
                <p>Loading clients...</p>
            </div>
        );

    }

    if (error) {

        return (
            <div className="admin-page">

                <h1>Clients</h1>

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

                    <h1>Clients</h1>

                    <p>
                        Manage JLEY-XMD client accounts
                    </p>

                </div>

                <div className="page-count">
                    {clients.length} Clients
                </div>

            </div>

            <div className="clients-table-wrapper">

                <table className="clients-table">

                    <thead>

                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>JL Balance</th>
                            <th>Deployments</th>
                            <th>Status</th>
                            <th>Joined</th>
                        </tr>

                    </thead>

                    <tbody>

                        {clients.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="empty-state"
                                >
                                    No clients found.
                                </td>

                            </tr>

                        ) : (

                            clients.map((client) => {

                                const deployments =
                                    client.deployments || [];

                                const running =
                                    deployments.filter(
                                        (deployment) =>
                                            deployment.status === "RUNNING"
                                    ).length;

                                return (

                                    <tr key={client.id}>

                                        <td>
                                            {client.name}
                                        </td>

                                        <td>
                                            {client.email}
                                        </td>

                                        <td>
                                            {client.wallet?.balance ?? 0} JL
                                        </td>

                                        <td>
                                            {deployments.length}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    running > 0
                                                        ? "status-active"
                                                        : "status-inactive"
                                                }
                                            >
                                                {running > 0
                                                    ? `${running} Running`
                                                    : "Inactive"
                                                }
                                            </span>

                                        </td>

                                        <td>
                                            {client.createdAt
                                                ? new Date(
                                                    client.createdAt
                                                ).toLocaleDateString("en-GB")
                                                : "N/A"
                                            }
                                        </td>

                                    </tr>

                                );

                            })

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default Clients;
