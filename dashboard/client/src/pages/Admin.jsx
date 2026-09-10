import { useEffect, useState } from "react";

import {
    apiGet,
    apiPut
} from "../services/api";


export default function Admin({ user }) {

    const [settings, setSettings] = useState({
        jlRateKES: "",
        deploymentCost: "",
        welcomeBonus: ""
    });

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    const isAdmin =
        user?.role === "ADMIN";


    useEffect(() => {

        if (!isAdmin) {
            setLoading(false);
            return;
        }

        loadSettings();

    }, [isAdmin]);


    async function loadSettings() {

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const data =
                await apiGet(
                    "/api/admin/settings/jl"
                );


            const values =
                data?.settings || {};


            setSettings({

                jlRateKES:
                    values.jlRateKES ?? "",

                deploymentCost:
                    values.deploymentCost ?? "",

                welcomeBonus:
                    values.welcomeBonus ?? ""

            });


        } catch (error) {

            console.error(
                "Admin settings error:",
                error
            );

            setError(
                error.message ||
                "Failed to load admin settings."
            );

        } finally {

            setLoading(false);

        }

    }


    function updateField(
        field,
        value
    ) {

        setSettings(
            current => ({
                ...current,
                [field]: value
            })
        );

    }


    async function saveSettings(
        event
    ) {

        event.preventDefault();

        setSaving(true);
        setError("");
        setMessage("");


        try {

            const data =
                await apiPut(
                    "/api/admin/settings/jl",
                    {
                        jlRateKES:
                            Number(
                                settings.jlRateKES
                            ),

                        deploymentCost:
                            Number(
                                settings.deploymentCost
                            ),

                        welcomeBonus:
                            Number(
                                settings.welcomeBonus
                            )
                    }
                );


            const values =
                data?.settings || {};


            setSettings({

                jlRateKES:
                    values.jlRateKES ?? "",

                deploymentCost:
                    values.deploymentCost ?? "",

                welcomeBonus:
                    values.welcomeBonus ?? ""

            });


            setMessage(
                data?.message ||
                "JL settings updated successfully."
            );


        } catch (error) {

            console.error(
                "Admin settings update error:",
                error
            );

            setError(
                error.message ||
                "Failed to update settings."
            );

        } finally {

            setSaving(false);

        }

    }


    /* =========================
       ACCESS DENIED
    ========================== */

    if (!isAdmin) {

        return (

            <section className="page-section admin-page">

                <div className="admin-hero">

                    <div className="admin-eyebrow">
                        JLEY-XMD / SECURITY
                    </div>

                    <div className="admin-title-row">

                        <div className="admin-title-icon">
                            🛡️
                        </div>

                        <div>
                            <h1>Admin Console</h1>

                            <p>
                                System control center
                            </p>
                        </div>

                    </div>

                </div>


                <div className="admin-access-denied">

                    <div className="admin-lock-icon">
                        🔒
                    </div>

                    <div>

                        <div className="admin-section-label">
                            ACCESS RESTRICTED
                        </div>

                        <h2>
                            Administrator privileges required
                        </h2>

                        <p>
                            Your account does not have permission
                            to access the JLEY-XMD administration
                            console.
                        </p>

                    </div>

                </div>

            </section>

        );

    }


    /* =========================
       LOADING
    ========================== */

    if (loading) {

        return (

            <section className="page-section admin-page">

                <div className="admin-hero">

                    <div className="admin-eyebrow">
                        JLEY-XMD / ADMIN CONSOLE
                    </div>

                    <div className="admin-title-row">

                        <div className="admin-title-icon">
                            🛡️
                        </div>

                        <div>

                            <h1>
                                System Control Center
                            </h1>

                            <p>
                                Initializing administrative environment...
                            </p>

                        </div>

                    </div>

                </div>


                <div className="admin-loading-card">

                    <div className="admin-loader"></div>

                    <div>

                        <strong>
                            Loading configuration
                        </strong>

                        <span>
                            Connecting to JLEY-XMD control services...
                        </span>

                    </div>

                </div>

            </section>

        );

    }


    return (

        <section className="page-section admin-page">


            {/* =========================
                HERO
            ========================== */}

            <div className="admin-hero">

                <div className="admin-eyebrow">
                    JLEY-XMD / ADMIN CONSOLE
                </div>


                <div className="admin-hero-main">

                    <div>

                        <div className="admin-title-row">

                            <div className="admin-title-icon">
                                🛡️
                            </div>

                            <div>

                                <h1>
                                    System Control Center
                                </h1>

                                <p>
                                    Manage core JLEY-XMD platform configuration
                                </p>

                            </div>

                        </div>

                    </div>


                    <div className="admin-status">

                        <span className="admin-status-dot"></span>

                        <span>
                            SYSTEM SECURE
                        </span>

                    </div>

                </div>

            </div>


            {/* =========================
                ALERTS
            ========================== */}

            {error && (

                <div className="admin-alert admin-alert-error">

                    <div className="admin-alert-icon">
                        !
                    </div>

                    <div>

                        <strong>
                            Configuration error
                        </strong>

                        <span>
                            {error}
                        </span>

                    </div>

                </div>

            )}


            {message && (

                <div className="admin-alert admin-alert-success">

                    <div className="admin-alert-icon">
                        ✓
                    </div>

                    <div>

                        <strong>
                            Configuration applied
                        </strong>

                        <span>
                            {message}
                        </span>

                    </div>

                </div>

            )}


            {/* =========================
                OPERATOR PROFILE
            ========================== */}

            <div className="admin-card admin-operator-card">

                <div className="admin-card-header">

                    <div>

                        <div className="admin-section-label">
                            OPERATOR ACCESS
                        </div>

                        <h2>
                            Administrator
                        </h2>

                    </div>

                    <div className="admin-role-badge">
                        ADMIN
                    </div>

                </div>


                <div className="admin-operator-grid">

                    <div className="admin-operator-item">

                        <span>
                            NAME
                        </span>

                        <strong>
                            {user.name}
                        </strong>

                    </div>


                    <div className="admin-operator-item">

                        <span>
                            EMAIL
                        </span>

                        <strong>
                            {user.email}
                        </strong>

                    </div>


                    <div className="admin-operator-item">

                        <span>
                            ACCESS LEVEL
                        </span>

                        <strong>
                            {user.role}
                        </strong>

                    </div>

                </div>

            </div>


            {/* =========================
                JL ECONOMY
            ========================== */}

            <div className="admin-card">

                <div className="admin-card-header">

                    <div>

                        <div className="admin-section-label">
                            CORE CONFIGURATION
                        </div>

                        <h2>
                            JL Economy
                        </h2>

                        <p>
                            Control JL pricing, deployment costs,
                            and new-account incentives.
                        </p>

                    </div>

                    <div className="admin-module-icon">
                        JL
                    </div>

                </div>


                {/* SUMMARY */}

                <div className="admin-metrics">

                    <div className="admin-metric">

                        <span>
                            JL RATE
                        </span>

                        <strong>
                            {settings.jlRateKES || "—"}
                        </strong>

                        <small>
                            KES / JL
                        </small>

                    </div>


                    <div className="admin-metric">

                        <span>
                            DEPLOYMENT
                        </span>

                        <strong>
                            {settings.deploymentCost || "—"}
                        </strong>

                        <small>
                            JL / deployment
                        </small>

                    </div>


                    <div className="admin-metric">

                        <span>
                            WELCOME BONUS
                        </span>

                        <strong>
                            {settings.welcomeBonus || "—"}
                        </strong>

                        <small>
                            JL / new account
                        </small>

                    </div>

                </div>


                {/* CONFIGURATION */}

                <form
                    onSubmit={saveSettings}
                    className="admin-form"
                >

                    <div className="admin-form-grid">


                        {/* JL RATE */}

                        <div className="admin-field">

                            <label>
                                JL Rate
                            </label>

                            <div className="admin-input-wrap">

                                <span className="admin-input-prefix">
                                    KES
                                </span>

                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={
                                        settings.jlRateKES
                                    }
                                    onChange={
                                        event =>
                                            updateField(
                                                "jlRateKES",
                                                event.target.value
                                            )
                                    }
                                    required
                                />

                            </div>

                            <small>
                                Cost of one JL in Kenyan Shillings.
                            </small>

                        </div>


                        {/* DEPLOYMENT COST */}

                        <div className="admin-field">

                            <label>
                                Deployment Cost
                            </label>

                            <div className="admin-input-wrap">

                                <span className="admin-input-prefix">
                                    JL
                                </span>

                                <input
                                    type="number"
                                    min="1"
                                    step="1"
                                    value={
                                        settings.deploymentCost
                                    }
                                    onChange={
                                        event =>
                                            updateField(
                                                "deploymentCost",
                                                event.target.value
                                            )
                                    }
                                    required
                                />

                            </div>

                            <small>
                                JL charged when a deployment is created.
                            </small>

                        </div>


                        {/* WELCOME BONUS */}

                        <div className="admin-field">

                            <label>
                                Welcome Bonus
                            </label>

                            <div className="admin-input-wrap">

                                <span className="admin-input-prefix">
                                    JL
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                        settings.welcomeBonus
                                    }
                                    onChange={
                                        event =>
                                            updateField(
                                                "welcomeBonus",
                                                event.target.value
                                            )
                                    }
                                    required
                                />

                            </div>

                            <small>
                                JL automatically given to eligible new accounts.
                            </small>

                        </div>

                    </div>


                    <div className="admin-form-footer">

                        <div className="admin-save-info">

                            <span className="admin-save-dot"></span>

                            <span>
                                Changes affect future transactions.
                            </span>

                        </div>


                        <button
                            type="submit"
                            disabled={saving}
                            className="admin-save-button"
                        >

                            {saving ? (
                                <>
                                    <span className="admin-button-loader"></span>
                                    Applying...
                                </>
                            ) : (
                                <>
                                    Apply Configuration
                                    <span className="admin-button-arrow">
                                        →
                                    </span>
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>


            {/* =========================
                ADMIN MODULES
            ========================== */}

            <div className="admin-card">

                <div className="admin-card-header">

                    <div>

                        <div className="admin-section-label">
                            PLATFORM ROADMAP
                        </div>

                        <h2>
                            Administration Modules
                        </h2>

                        <p>
                            The JLEY-XMD control center will expand
                            with additional management tools.
                        </p>

                    </div>

                </div>


                <div className="admin-modules-grid">


                    <div className="admin-module-card">

                        <div className="admin-module-top">

                            <div className="admin-module-symbol">
                                U
                            </div>

                            <span className="admin-module-badge planned">
                                PLANNED
                            </span>

                        </div>

                        <h3>
                            User Management
                        </h3>

                        <p>
                            Manage accounts, roles and user access.
                        </p>

                    </div>


                    <div className="admin-module-card">

                        <div className="admin-module-top">

                            <div className="admin-module-symbol">
                                W
                            </div>

                            <span className="admin-module-badge planned">
                                PLANNED
                            </span>

                        </div>

                        <h3>
                            Wallet Management
                        </h3>

                        <p>
                            Inspect and manage JL wallet activity.
                        </p>

                    </div>


                    <div className="admin-module-card">

                        <div className="admin-module-top">

                            <div className="admin-module-symbol">
                                T
                            </div>

                            <span className="admin-module-badge planned">
                                PLANNED
                            </span>

                        </div>

                        <h3>
                            JL Transactions
                        </h3>

                        <p>
                            Monitor JL credits, charges and transfers.
                        </p>

                    </div>


                    <div className="admin-module-card">

                        <div className="admin-module-top">

                            <div className="admin-module-symbol">
                                D
                            </div>

                            <span className="admin-module-badge planned">
                                PLANNED
                            </span>

                        </div>

                        <h3>
                            Deployment Control
                        </h3>

                        <p>
                            Monitor and manage platform deployments.
                        </p>

                    </div>


                    <div className="admin-module-card">

                        <div className="admin-module-top">

                            <div className="admin-module-symbol">
                                B
                            </div>

                            <span className="admin-module-badge planned">
                                PLANNED
                            </span>

                        </div>

                        <h3>
                            Bot Monitoring
                        </h3>

                        <p>
                            Observe bot engine health and activity.
                        </p>

                    </div>


                    <div className="admin-module-card">

                        <div className="admin-module-top">

                            <div className="admin-module-symbol">
                                L
                            </div>

                            <span className="admin-module-badge planned">
                                PLANNED
                            </span>

                        </div>

                        <h3>
                            System Logs
                        </h3>

                        <p>
                            Review platform events and operational logs.
                        </p>

                    </div>


                    <div className="admin-module-card">

                        <div className="admin-module-top">

                            <div className="admin-module-symbol">
                                R
                            </div>

                            <span className="admin-module-badge planned">
                                PLANNED
                            </span>

                        </div>

                        <h3>
                            Release Center
                        </h3>

                        <p>
                            Manage JLEY-XMD releases and updates.
                        </p>

                    </div>


                </div>

            </div>


            {/* =========================
                FOOTER
            ========================== */}

            <div className="admin-console-footer">

                <span>
                    JLEY-XMD ADMIN CONSOLE
                </span>

                <span>
                    SECURE CONTROL ENVIRONMENT
                </span>

            </div>

        </section>

    );

}