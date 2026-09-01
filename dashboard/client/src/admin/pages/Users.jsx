
import { useEffect, useState } from "react";

import {
    apiGet,
    apiPost
} from "../../services/api";


export default function Users() {

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [creditingUser, setCreditingUser] = useState(null);


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


    async function giveJL(user) {

        const amountInput = window.prompt(
            `How much JL do you want to give ${user.name || user.email}?`,
            "50"
        );

        if (amountInput === null) {
            return;
        }


        const amount = Number(
            amountInput.trim()
        );


        if (
            !Number.isInteger(amount) ||
            amount <= 0
        ) {

            window.alert(
                "Enter a positive whole number."
            );

            return;

        }


        const confirmed = window.confirm(
            `Give ${amount} JL to ${user.email}?`
        );


        if (!confirmed) {
            return;
        }


        try {

            setCreditingUser(user.id);
            setError("");


            const data = await apiPost(
                "/api/admin/users/credit",
                {
                    userId: user.id,
                    amount,
                    description:
                        `Admin credit for ${user.email}`
                }
            );


            window.alert(
                data?.message ||
                `${amount} JL credited successfully.`
            );


        } catch (error) {

            console.error(
                "JL credit error:",
                error
            );


            setError(
                error.message ||
                "Failed to credit JL."
            );

        } finally {

            setCreditingUser(null);

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

                                    <th>
                                        JL
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


                                        <td>

                                            {user.role !== "ADMIN" && (

                                                <button
                                                    type="button"
                                                    className="admin-action-btn"
                                                    onClick={() =>
                                                        giveJL(user)
                                                    }
                                                    disabled={
                                                        creditingUser ===
                                                        user.id
                                                    }
                                                >
                                                    {creditingUser ===
                                                    user.id
                                                        ? "Crediting..."
                                                        : "Give JL"}
                                                </button>

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
