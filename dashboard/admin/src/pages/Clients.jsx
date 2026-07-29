
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
    getAdminClients,
    suspendClient,
    unsuspendClient,
    blockClient,
    unblockClient,
    deleteClient,
    creditClientJL,
    creditAllClientsJL
} from "../services/api";

import "../styles/clients.css";


function Clients() {

    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [showCreditModal, setShowCreditModal] = useState(false);
    const [creditTarget, setCreditTarget] = useState(null);
    const [creditAmount, setCreditAmount] = useState("");


    async function loadClients() {

        try {

            setLoading(true);

            const response =
                await getAdminClients();

            setClients(
                response.clients || []
            );

        } catch (error) {

            console.error(
                "CLIENTS ERROR:",
                error
            );

            toast.error(
                error.message ||
                "Failed to load clients."
            );

        } finally {

            setLoading(false);

        }

    }


    useEffect(() => {

        loadClients();

    }, []);


    const filteredClients = useMemo(() => {

        const query =
            search.trim().toLowerCase();


        return clients.filter((client) => {

            const matchesSearch =
                !query ||
                client.name
                    ?.toLowerCase()
                    .includes(query) ||
                client.email
                    ?.toLowerCase()
                    .includes(query);


            let matchesStatus = true;


            if (statusFilter === "ACTIVE") {

                matchesStatus =
                    !client.suspended &&
                    !client.blocked;

            }


            if (statusFilter === "SUSPENDED") {

                matchesStatus =
                    client.suspended === true;

            }


            if (statusFilter === "BLOCKED") {

                matchesStatus =
                    client.blocked === true;

            }


            return (
                matchesSearch &&
                matchesStatus
            );

        });

    }, [clients, search, statusFilter]);


    async function performAction(
        key,
        action
    ) {

        try {

            setActionLoading(key);

            await action();

            await loadClients();

        } catch (error) {

            console.error(
                "ADMIN CLIENT ACTION ERROR:",
                error
            );

            toast.error(
                error.message ||
                "Action failed."
            );

        } finally {

            setActionLoading("");

        }

    }


    async function handleSuspend(client) {

        const action =
            client.suspended
                ? unsuspendClient
                : suspendClient;


        await performAction(
            `suspend-${client.id}`,
            async () => {

                const response =
                    await action(client.id);

                toast.success(
                    response.message
                );

            }
        );

    }


    async function handleBlock(client) {

        const action =
            client.blocked
                ? unblockClient
                : blockClient;


        await performAction(
            `block-${client.id}`,
            async () => {

                const response =
                    await action(client.id);

                toast.success(
                    response.message
                );

            }
        );

    }


    async function handleDelete(client) {

        const confirmed =
            window.confirm(
                `Delete ${client.name} (${client.email}) permanently?\n\nThis will remove the client and their related data. This action cannot be undone.`
            );


        if (!confirmed) {
            return;
        }


        await performAction(
            `delete-${client.id}`,
            async () => {

                const response =
                    await deleteClient(
                        client.id
                    );

                toast.success(
                    response.message
                );

            }
        );

    }


    function openCreditModal(client = null) {

        setCreditTarget(client);
        setCreditAmount("");
        setShowCreditModal(true);

    }


    function closeCreditModal() {

        if (actionLoading) {
            return;
        }

        setShowCreditModal(false);
        setCreditTarget(null);
        setCreditAmount("");

    }


    async function handleCreditJL(event) {

        event.preventDefault();


        const amount =
            Number(creditAmount);


        if (
            !Number.isInteger(amount) ||
            amount <= 0
        ) {

            toast.error(
                "Enter a valid positive JL amount."
            );

            return;

        }


        const targetName =
            creditTarget
                ? creditTarget.name
                : "all clients";


        const confirmed =
            window.confirm(
                `Credit ${amount} JL to ${targetName}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            setActionLoading("credit");


            if (creditTarget) {

                const response =
                    await creditClientJL(
                        creditTarget.id,
                        amount
                    );

                toast.success(
                    response.message
                );

            } else {

                const response =
                    await creditAllClientsJL(
                        amount
                    );

                toast.success(
                    response.message
                );

            }


            closeCreditModal();

            await loadClients();

        } catch (error) {

            console.error(
                "JL CREDIT ERROR:",
                error
            );

            toast.error(
                error.message ||
                "Failed to credit JL."
            );

        } finally {

            setActionLoading("");

        }

    }


    function getStatus(client) {

        if (client.blocked) {

            return {
                label: "Blocked",
                className: "client-status blocked"
            };

        }


        if (client.suspended) {

            return {
                label: "Suspended",
                className: "client-status suspended"
            };

        }


        return {
            label: "Active",
            className: "client-status active"
        };

    }


    if (loading) {

        return (

            <div className="admin-page">

                <div className="page-header">

                    <div>

                        <h1>Clients</h1>

                        <p>
                            Manage JLEY-XMD client accounts
                        </p>

                    </div>

                </div>

                <div className="admin-loading-card">

                    <div className="admin-spinner"></div>

                    <span>
                        Loading clients...
                    </span>

                </div>

            </div>

        );

    }


    return (

        <div className="admin-page">

            <div className="page-header">

                <div>

                    <span className="page-eyebrow">
                        CLIENT MANAGEMENT
                    </span>

                    <h1>
                        Clients
                    </h1>

                    <p>
                        Manage accounts, deployments and JL balances.
                    </p>

                </div>


                <div className="client-header-actions">

                    <div className="page-count">

                        {filteredClients.length}
                        {" "}
                        {filteredClients.length === 1
                            ? "Client"
                            : "Clients"
                        }

                    </div>


                    <button
                        className="admin-primary-btn"
                        onClick={() =>
                            openCreditModal(null)
                        }
                    >
                        + Credit JL to All
                    </button>

                </div>

            </div>


            <div className="client-toolbar">

                <div className="client-search">

                    <span>
                        Search
                    </span>

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search name or email..."
                    />

                </div>


                <div className="client-filters">

                    <button
                        className={
                            statusFilter === "ALL"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter("ALL")
                        }
                    >
                        All
                    </button>

                    <button
                        className={
                            statusFilter === "ACTIVE"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter("ACTIVE")
                        }
                    >
                        Active
                    </button>

                    <button
                        className={
                            statusFilter === "SUSPENDED"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter("SUSPENDED")
                        }
                    >
                        Suspended
                    </button>

                    <button
                        className={
                            statusFilter === "BLOCKED"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter("BLOCKED")
                        }
                    >
                        Blocked
                    </button>

                </div>

            </div>


            <div className="clients-table-wrapper">

                <table className="clients-table">

                    <thead>

                        <tr>

                            <th>
                                Client
                            </th>

                            <th>
                                JL Balance
                            </th>

                            <th>
                                Deployments
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Joined
                            </th>

                            <th>
                                Actions
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {filteredClients.length === 0 ? (

                            <tr>

                                <td
                                    colSpan="6"
                                    className="empty-state"
                                >
                                    No clients match your filters.
                                </td>

                            </tr>

                        ) : (

                            filteredClients.map(
                                (client) => {

                                    const deployments =
                                        client.deployments || [];


                                    const running =
                                        deployments.filter(
                                            (deployment) =>
                                                deployment.status ===
                                                "RUNNING"
                                        ).length;


                                    const status =
                                        getStatus(client);


                                    return (

                                        <tr
                                            key={client.id}
                                        >

                                            <td>

                                                <div className="client-identity">

                                                    <div className="client-avatar">
                                                        {client.name
                                                            ?.charAt(0)
                                                            ?.toUpperCase() ||
                                                            "C"}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {client.name}
                                                        </strong>

                                                        <span>
                                                            {client.email}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                <strong className="jl-balance">
                                                    {client.wallet?.balance ?? 0}
                                                    {" "}
                                                    JL
                                                </strong>

                                            </td>


                                            <td>

                                                <div className="deployment-summary">

                                                    <strong>
                                                        {deployments.length}
                                                    </strong>

                                                    {running > 0 && (

                                                        <span>
                                                            {running}
                                                            {" "}
                                                            running
                                                        </span>

                                                    )}

                                                </div>

                                            </td>


                                            <td>

                                                <span
                                                    className={
                                                        status.className
                                                    }
                                                >
                                                    <span className="status-dot"></span>
                                                    {status.label}
                                                </span>

                                            </td>


                                            <td>

                                                {client.createdAt
                                                    ? new Date(
                                                        client.createdAt
                                                    ).toLocaleDateString(
                                                        "en-GB"
                                                    )
                                                    : "—"
                                                }

                                            </td>


                                            <td>

                                                <div className="client-actions">

                                                    <button
                                                        className="action-btn credit"
                                                        disabled={
                                                            actionLoading !== ""
                                                        }
                                                        onClick={() =>
                                                            openCreditModal(
                                                                client
                                                            )
                                                        }
                                                    >
                                                        + JL
                                                    </button>


                                                    <button
                                                        className="action-btn suspend"
                                                        disabled={
                                                            actionLoading !== ""
                                                        }
                                                        onClick={() =>
                                                            handleSuspend(
                                                                client
                                                            )
                                                        }
                                                    >
                                                        {actionLoading ===
                                                        `suspend-${client.id}`
                                                            ? "..."
                                                            : client.suspended
                                                                ? "Restore"
                                                                : "Suspend"
                                                        }
                                                    </button>


                                                    <button
                                                        className="action-btn block"
                                                        disabled={
                                                            actionLoading !== ""
                                                        }
                                                        onClick={() =>
                                                            handleBlock(
                                                                client
                                                            )
                                                        }
                                                    >
                                                        {actionLoading ===
                                                        `block-${client.id}`
                                                            ? "..."
                                                            : client.blocked
                                                                ? "Unblock"
                                                                : "Block"
                                                        }
                                                    </button>


                                                    <button
                                                        className="action-btn delete"
                                                        disabled={
                                                            actionLoading !== ""
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                client
                                                            )
                                                        }
                                                    >
                                                        {actionLoading ===
                                                        `delete-${client.id}`
                                                            ? "..."
                                                            : "Delete"
                                                        }
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    );

                                }
                            )

                        )}

                    </tbody>

                </table>

            </div>


            {showCreditModal && (

                <div
                    className="admin-modal-backdrop"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeCreditModal();
                        }

                    }}
                >

                    <div className="admin-modal">

                        <div className="admin-modal-header">

                            <div>

                                <span className="page-eyebrow">
                                    JL WALLET
                                </span>

                                <h2>
                                    Credit JL
                                </h2>

                            </div>

                            <button
                                className="modal-close"
                                onClick={closeCreditModal}
                            >
                                ×
                            </button>

                        </div>


                        <p className="modal-description">

                            {creditTarget
                                ? `Add JL credits to ${creditTarget.name}'s wallet.`
                                : "Add JL credits to every client wallet."
                            }

                        </p>


                        <form
                            onSubmit={
                                handleCreditJL
                            }
                        >

                            <label className="modal-label">

                                JL Amount

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={creditAmount}
                                    onChange={(event) =>
                                        setCreditAmount(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. 50"
                                    autoFocus
                                />

                            </label>


                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="modal-cancel"
                                    onClick={
                                        closeCreditModal
                                    }
                                    disabled={
                                        actionLoading ===
                                        "credit"
                                    }
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="admin-primary-btn"
                                    disabled={
                                        actionLoading ===
                                        "credit"
                                    }
                                >
                                    {actionLoading ===
                                    "credit"
                                        ? "Crediting..."
                                        : creditTarget
                                            ? "Credit Client"
                                            : "Credit All Clients"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}


export default Clients;

