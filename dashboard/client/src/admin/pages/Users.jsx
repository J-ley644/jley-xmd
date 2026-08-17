import { useEffect, useState } from "react";

import { apiGet } from "../../services/api";


export default function Users() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    useEffect(() => {

        loadUsers();

    }, []);


    async function loadUsers() {

        try {

            setLoading(true);
            setError("");

            const data = await apiGet(
                "/api/admin/users"
            );

            setUsers(
                data?.users ||
                []
            );

        } catch (error) {

            console.error(
                "Users loading error:",
                error
            );

            setError(
                error.message ||
                "Failed to load users."
            );

        } finally {

            setLoading(false);

        }

    }


    function formatDate(date) {

        if (!date) {
            return "—";
        }

        return new Date(date)
            .toLocaleDateString();

    }


    return (

        <section className="admin-page">

            <div className="admin-page-header">

                <div>

                    <h1>
                        Users
                    </h1>

                    <p>
                        Manage JLEY-XMD client accounts.
                    </p>

                </div>

                <div className="admin-count-badge">

                    {users.length} Users

                </div>

            </div>


            {error && (

                <div className="admin-error-box">
                    {error}
                </div>

            )}


            <div className="admin-card">

                {loading ? (

                    <div className="admin-loading-inline">

                        Loading users...

                    </div>

                ) : users.length === 0 ? (

                    <div className="admin-empty">

                        <h3>
                            No users found
                        </h3>

                        <p>
                            There are currently no
                            registered users.
                        </p>

                    </div>

                ) : (

                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Email
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Joined
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {users.map(user => (

                                    <tr key={user.id}>

                                        <td>

                                            <div className="admin-table-user">

                                                <div className="admin-avatar">

                                                    {(user.name ||
                                                        "U")
                                                        .charAt(0)
                                                        .toUpperCase()}

                                                </div>

                                                <strong>
                                                    {user.name ||
                                                        "Unnamed User"}
                                                </strong>

                                            </div>

                                        </td>

                                        <td>
                                            {user.email}
                                        </td>

                                        <td>

                                            <span
                                                className={
                                                    user.role ===
                                                    "ADMIN"
                                                        ? "role-badge admin"
                                                        : "role-badge"
                                                }
                                            >
                                                {user.role}
                                            </span>

                                        </td>

                                        <td>
                                            {formatDate(
                                                user.createdAt
                                            )}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </section>

    );

}