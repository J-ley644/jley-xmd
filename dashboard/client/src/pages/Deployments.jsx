import { useState } from "react";

export default function Deployments({
    deployments = [],
    onPair,
    onPairCode,
    onStop,
    botName,
    setBotName,
    deployBot,
    deploying,
    pairingId,
    qr,
    pairingCode,
    onRefresh
}) {
    const [expandedId, setExpandedId] = useState(null);

    function getExpiryInfo(expiresAt) {
        if (!expiresAt) {
            return {
                label: "Not activated",
                expired: false,
                days: null
            };
        }

        const expiry = new Date(expiresAt);
        const diff = expiry.getTime() - Date.now();

        if (diff <= 0) {
            return {
                label: "Expired",
                expired: true,
                days: 0
            };
        }

        const days = Math.ceil(
            diff / (1000 * 60 * 60 * 24)
        );

        return {
            label: `${days} day${days === 1 ? "" : "s"} left`,
            expired: false,
            days
        };
    }

    function toggleDetails(id) {
        setExpandedId(
            expandedId === id ? null : id
        );
    }

    return (
        <section className="page-section deployments-page">

            {/* HEADER */}

            <div className="page-header deployments-page-header">
                <div>
                    <div className="page-kicker">
                        JLEY-XMD CONTROL CENTER
                    </div>

                    <h1>Your Deployments</h1>

                    <p>
                        Deploy, connect and manage your WhatsApp bots
                        from one place.
                    </p>
                </div>

                <div className="deployment-count-badge">
                    <span>●</span>
                    {deployments.length}{" "}
                    {deployments.length === 1
                        ? "Deployment"
                        : "Deployments"}
                </div>
            </div>


            {/* CREATE DEPLOYMENT */}

            <div className="create-deployment deployment-create-card">

                <div className="create-deployment-content">

                    <div className="create-deployment-icon">
                        🤖
                    </div>

                    <div>
                        <div className="page-kicker">
                            NEW DEPLOYMENT
                        </div>

                        <h2>Deploy a new JLEY-XMD bot</h2>

                        <p>
                            Create your bot, then connect it to WhatsApp
                            using QR code or phone pairing.
                        </p>
                    </div>

                </div>

                <div className="create-deployment-meta">
                    <span>
                        <strong>50 JL</strong>
                        <small>per deployment</small>
                    </span>

                    <span>
                        <strong>32 days</strong>
                        <small>deployment lifetime</small>
                    </span>
                </div>

                <div className="create-deployment-form">

                    <input
                        placeholder="Enter bot name"
                        value={botName}
                        onChange={e =>
                            setBotName(e.target.value)
                        }
                    />

                    <button
                        onClick={deployBot}
                        disabled={
                            deploying ||
                            !botName.trim()
                        }
                    >
                        {deploying
                            ? "Deploying..."
                            : "🚀 Create Deployment"}
                    </button>

                </div>

            </div>


            {/* EMPTY STATE */}

            {deployments.length === 0 ? (

                <div className="dashboard-card deployment-empty-card">

                    <div className="empty-state">

                        <div className="empty-icon">
                            🤖
                        </div>

                        <div className="page-kicker">
                            GET STARTED
                        </div>

                        <h2>
                            No deployments yet
                        </h2>

                        <p>
                            Create your first JLEY-XMD deployment
                            using the form above.
                        </p>

                    </div>

                </div>

            ) : (

                <div className="deployment-list">

                    {deployments.map(bot => {

                        const expiry =
                            getExpiryInfo(bot.expiresAt);

                        const connected =
                            bot.connectionStatus === "CONNECTED";

                        const stopped =
                            bot.status === "STOPPED";

                        const expanded =
                            expandedId === bot.id;

                        const pairing =
                            pairingId === bot.id;

                        const canPair =
                            !expiry.expired &&
                            !stopped;

                        const statusClass =
                            connected
                                ? "connected"
                                : stopped
                                    ? "offline"
                                    : "pending";

                        const statusLabel =
                            connected
                                ? "ONLINE"
                                : stopped
                                    ? "STOPPED"
                                    : "NOT CONNECTED";

                        return (

                            <article
                                key={bot.id}
                                className={`deployment-row deployment-card-modern ${
                                    expanded
                                        ? "is-expanded"
                                        : ""
                                }`}
                            >

                                {/* CARD HEADER */}

                                <div className="deployment-summary">

                                    <div className="deployment-bot">

                                        <div className="bot-icon-modern">
                                            🤖
                                        </div>

                                        <div className="deployment-bot-name">

                                            <div className="deployment-title-line">

                                                <strong>
                                                    {bot.botName ||
                                                        "Unnamed Bot"}
                                                </strong>

                                                <span
                                                    className={`deployment-status-pill ${statusClass}`}
                                                >
                                                    <i />
                                                    {statusLabel}
                                                </span>

                                            </div>

                                            <small>
                                                JLEY-XMD deployment
                                                <span>•</span>
                                                ID: {bot.id?.slice(0, 8)}
                                            </small>

                                        </div>

                                    </div>


                                    <div className="deployment-summary-right">

                                        <div className="deployment-expiry-modern">

                                            <small>
                                                DEPLOYMENT LIFETIME
                                            </small>

                                            <strong
                                                className={
                                                    expiry.expired
                                                        ? "expiry-danger"
                                                        : expiry.days !== null &&
                                                          expiry.days <= 3
                                                            ? "expiry-warning"
                                                            : ""
                                                }
                                            >
                                                {expiry.label}
                                            </strong>

                                        </div>

                                        <button
                                            className="details-button-modern"
                                            onClick={() =>
                                                toggleDetails(bot.id)
                                            }
                                        >
                                            {expanded
                                                ? "Hide"
                                                : "Manage"}
                                            <span>
                                                {expanded ? "↑" : "→"}
                                            </span>
                                        </button>

                                    </div>

                                </div>


                                {/* QUICK STATUS */}

                                <div className="deployment-health">

                                    <div className="health-item">

                                        <span className="health-icon">
                                            {connected ? "✓" : "○"}
                                        </span>

                                        <div>
                                            <small>
                                                WhatsApp
                                            </small>

                                            <strong>
                                                {connected
                                                    ? "Connected"
                                                    : "Not connected"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="health-item">

                                        <span className="health-icon">
                                            {bot.sessionReady
                                                ? "✓"
                                                : "○"}
                                        </span>

                                        <div>
                                            <small>
                                                Session
                                            </small>

                                            <strong>
                                                {bot.sessionReady
                                                    ? "Ready"
                                                    : "Not paired"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="health-item">

                                        <span className="health-icon">
                                            {stopped ? "⏸" : "▶"}
                                        </span>

                                        <div>
                                            <small>
                                                Engine
                                            </small>

                                            <strong>
                                                {stopped
                                                    ? "Stopped"
                                                    : "Running"}
                                            </strong>
                                        </div>

                                    </div>


                                    <div className="health-item">

                                        <span className="health-icon">
                                            ⏱
                                        </span>

                                        <div>
                                            <small>
                                                Expires
                                            </small>

                                            <strong>
                                                {bot.expiresAt
                                                    ? new Date(
                                                        bot.expiresAt
                                                    ).toLocaleDateString()
                                                    : "Not available"}
                                            </strong>
                                        </div>

                                    </div>

                                </div>


                                {/* DETAILS */}

                                {expanded && (

                                    <div className="deployment-details-modern">

                                        <div className="deployment-details-header">

                                            <div>
                                                <small>
                                                    DEPLOYMENT MANAGEMENT
                                                </small>

                                                <h3>
                                                    {bot.botName ||
                                                        "Unnamed Bot"}
                                                </h3>
                                            </div>

                                            <span
                                                className={`deployment-status-pill ${statusClass}`}
                                            >
                                                <i />
                                                {statusLabel}
                                            </span>

                                        </div>


                                        {/* DETAILS GRID */}

                                        <div className="details-grid-modern">

                                            <div>
                                                <small>
                                                    Deployment Status
                                                </small>

                                                <strong>
                                                    {bot.status ||
                                                        "UNKNOWN"}
                                                </strong>
                                            </div>


                                            <div>
                                                <small>
                                                    WhatsApp Connection
                                                </small>

                                                <strong>
                                                    {bot.connectionStatus ||
                                                        "OFFLINE"}
                                                </strong>
                                            </div>


                                            <div>
                                                <small>
                                                    Session
                                                </small>

                                                <strong>
                                                    {bot.sessionReady
                                                        ? "Ready"
                                                        : "Not Paired"}
                                                </strong>
                                            </div>


                                            <div>
                                                <small>
                                                    Deployment ID
                                                </small>

                                                <strong>
                                                    {bot.id || "—"}
                                                </strong>
                                            </div>


                                            <div>
                                                <small>
                                                    Created
                                                </small>

                                                <strong>
                                                    {bot.createdAt
                                                        ? new Date(
                                                            bot.createdAt
                                                        ).toLocaleString()
                                                        : "—"}
                                                </strong>
                                            </div>


                                            <div>
                                                <small>
                                                    Last Connected
                                                </small>

                                                <strong>
                                                    {bot.lastConnected
                                                        ? new Date(
                                                            bot.lastConnected
                                                        ).toLocaleString()
                                                        : "Never"}
                                                </strong>
                                            </div>


                                            <div>
                                                <small>
                                                    Expires
                                                </small>

                                                <strong>
                                                    {bot.expiresAt
                                                        ? new Date(
                                                            bot.expiresAt
                                                        ).toLocaleString()
                                                        : "Not available"}
                                                </strong>
                                            </div>

                                        </div>


                                        {/* PAIRING */}

                                        {pairing && qr && (

                                            <div className="pairing-panel pairing-panel-modern">

                                                <div>
                                                    <span className="pairing-panel-badge">
                                                        QR PAIRING
                                                    </span>

                                                    <h3>
                                                        Connect WhatsApp
                                                    </h3>

                                                    <p>
                                                        Open WhatsApp →
                                                        Linked Devices →
                                                        Link a device.
                                                    </p>
                                                </div>

                                                <img
                                                    src={qr}
                                                    alt="WhatsApp QR Code"
                                                    className="deployment-qr"
                                                />

                                            </div>

                                        )}


                                        {/* PAIRING CODE */}

                                        {pairing && pairingCode && (

                                            <div className="pairing-code-panel pairing-code-panel-modern">

                                                <span className="pairing-panel-badge">
                                                    PHONE PAIRING
                                                </span>

                                                <h3>
                                                    WhatsApp Pairing Code
                                                </h3>

                                                <p>
                                                    Open WhatsApp and use
                                                    the linked-device
                                                    pairing option.
                                                </p>

                                                <div className="pairing-code">
                                                    {pairingCode}
                                                </div>

                                            </div>

                                        )}


                                        {/* ACTIONS */}

                                        <div className="deployment-actions deployment-actions-modern">

                                            <button
                                                onClick={() =>
                                                    onPair(bot.id)
                                                }
                                                disabled={
                                                    !canPair ||
                                                    pairing ||
                                                    connected
                                                }
                                            >
                                                {pairing
                                                    ? "Waiting..."
                                                    : connected
                                                        ? "✓ Connected"
                                                        : "▣ QR Pair"}
                                            </button>


                                            <button
                                                onClick={() =>
                                                    onPairCode(bot.id)
                                                }
                                                disabled={
                                                    !canPair ||
                                                    pairing ||
                                                    connected
                                                }
                                            >
                                                ☎ Phone Pair
                                            </button>


                                            <button
                                                onClick={() =>
                                                    onStop(bot.id)
                                                }
                                                disabled={stopped}
                                            >
                                                {stopped
                                                    ? "⏸ Stopped"
                                                    : "⏹ Stop Bot"}
                                            </button>

                                        </div>

                                    </div>

                                )}

                            </article>
                        );
                    })}

                </div>

            )}

        </section>
    );
}