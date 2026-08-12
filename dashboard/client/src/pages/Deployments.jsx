
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
        <section className="page-section">

            {/* HEADER */}

            <div className="page-header">

                <div>
                    <h1>Deployments</h1>

                    <p>
                        Deploy and manage your JLEY-XMD bots.
                    </p>
                </div>

            </div>


            {/* CREATE DEPLOYMENT */}

            <div className="create-deployment">

                <h2>🚀 Deploy New Bot</h2>

                <p>
                    Each deployment costs 50 JL and runs for 32 days.
                </p>

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
                            : "Create Deployment — 50 JL"}
                    </button>

                </div>

            </div>


            {/* DEPLOYMENTS */}

            {deployments.length === 0 ? (

                <div className="dashboard-card">

                    <div className="empty-state">

                        <div className="empty-icon">
                            🤖
                        </div>

                        <h2>
                            No deployments yet
                        </h2>

                        <p>
                            Create your first JLEY-XMD deployment above.
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

                        const expanded =
                            expandedId === bot.id;

                        const pairing =
                            pairingId === bot.id;

                        const canPair =
                            !expiry.expired &&
                            bot.status !== "STOPPED";

                        return (

                            <div
                                key={bot.id}
                                className="deployment-row"
                            >

                                {/* COMPACT ROW */}

                                <div className="deployment-summary">

                                    <div className="deployment-bot">

                                        <div className="bot-icon">
                                            🤖
                                        </div>

                                        <div>

                                            <strong>
                                                {bot.botName || "Unnamed Bot"}
                                            </strong>

                                            <small>
                                                ID: {bot.id?.slice(0, 8)}
                                            </small>

                                        </div>

                                    </div>


                                    <div className="deployment-status">

                                        <span
                                            className={
                                                connected
                                                    ? "status connected"
                                                    : bot.status === "STOPPED"
                                                        ? "status offline"
                                                        : "status pending"
                                            }
                                        >
                                            {bot.connectionStatus || "OFFLINE"}
                                        </span>

                                    </div>


                                    <div className="deployment-expiry">

                                        <small>
                                            Lifetime
                                        </small>

                                        <strong
                                            style={{
                                                color:
                                                    expiry.expired
                                                        ? "#ef4444"
                                                        : expiry.days !== null &&
                                                          expiry.days <= 3
                                                            ? "#f59e0b"
                                                            : undefined
                                            }}
                                        >
                                            {expiry.label}
                                        </strong>

                                    </div>


                                    <button
                                        className="details-button"
                                        onClick={() =>
                                            toggleDetails(bot.id)
                                        }
                                    >
                                        {expanded
                                            ? "Hide Details"
                                            : "View Details"}
                                    </button>

                                </div>


                                {/* DETAILS */}

                                {expanded && (

                                    <div className="deployment-details">

                                        <div className="details-grid">

                                            <div>
                                                <small>
                                                    Deployment Status
                                                </small>

                                                <strong>
                                                    {bot.status || "UNKNOWN"}
                                                </strong>
                                            </div>


                                            <div>
                                                <small>
                                                    Connection
                                                </small>

                                                <strong>
                                                    {bot.connectionStatus || "OFFLINE"}
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

                                        </div>


                                        {/* QR */}

                                        {pairing && qr && (

                                            <div className="pairing-panel">

                                                <h3>
                                                    Scan QR Code
                                                </h3>

                                                <p>
                                                    Open WhatsApp → Linked Devices
                                                    → Link a device.
                                                </p>

                                                <img
                                                    src={qr}
                                                    alt="WhatsApp QR Code"
                                                    className="deployment-qr"
                                                />

                                            </div>

                                        )}


                                        {/* PAIRING CODE */}

                                        {pairing && pairingCode && (

                                            <div className="pairing-code-panel">

                                                <h3>
                                                    WhatsApp Pairing Code
                                                </h3>

                                                <p>
                                                    Open WhatsApp and use the
                                                    linked-device pairing option.
                                                </p>

                                                <div className="pairing-code">
                                                    {pairingCode}
                                                </div>

                                            </div>

                                        )}


                                        {/* ACTIONS */}

                                        <div className="deployment-actions">

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
                                                        ? "Connected"
                                                        : "📷 QR Pair"}
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
                                                📱 Phone Pair
                                            </button>


                                            <button
                                                onClick={() =>
                                                    onStop(bot.id)
                                                }
                                                disabled={
                                                    bot.status === "STOPPED"
                                                }
                                            >
                                                ⛔ Stop
                                            </button>

                                        </div>

                                    </div>

                                )}

                            </div>
                        );
                    })}

                </div>
            )}

        </section>
    );
}

