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


    /*
     * FRONTEND ADMIN GUARD
     *
     * This improves the UI experience.
     *
     * The real security protection remains
     * the backend admin middleware.
     */

    if (!isAdmin) {

        return (

            <section className="page-section">

                <div className="page-header">

                    <div>

                        <h1>
                            🛡️ Admin
                        </h1>

                        <p>
                            Administrative controls
                        </p>

                    </div>

                </div>


                <div className="dashboard-card">

                    <h2>
                        Access denied
                    </h2>

                    <p>
                        You do not have permission
                        to access the administrator
                        dashboard.
                    </p>

                </div>

            </section>

        );

    }


    if (loading) {

        return (

            <section className="page-section">

                <div className="page-header">

                    <div>

                        <h1>
                            🛡️ Admin Dashboard
                        </h1>

                        <p>
                            System administration
                        </p>

                    </div>

                </div>


                <div className="dashboard-card">

                    <p>
                        Loading administrator settings...
                    </p>

                </div>

            </section>

        );

    }


    return (

        <section className="page-section">

            <div className="page-header">

                <div>

                    <h1>
                        🛡️ Admin Dashboard
                    </h1>

                    <p>
                        Manage JLEY-XMD system settings
                    </p>

                </div>

            </div>


            {error && (

                <div className="error-box">

                    {error}

                </div>

            )}


            {message && (

                <div className="success-box">

                    {message}

                </div>

            )}


            {/* ADMIN INFORMATION */}

            <div className="dashboard-card">

                <h2>
                    Administrator
                </h2>

                <p>
                    <strong>
                        Name:
                    </strong>{" "}
                    {user.name}
                </p>

                <p>
                    <strong>
                        Email:
                    </strong>{" "}
                    {user.email}
                </p>

                <p>
                    <strong>
                        Role:
                    </strong>{" "}
                    {user.role}
                </p>

            </div>


            {/* JL ECONOMY */}

            <div className="dashboard-card">

                <div className="page-header">

                    <div>

                        <h2>
                            JL Economy
                        </h2>

                        <p>
                            Configure JL pricing and
                            account bonuses.
                        </p>

                    </div>

                </div>


                <form
                    onSubmit={saveSettings}
                >

                    {/* JL RATE */}

                    <div className="form-group">

                        <label>
                            JL Rate — KES
                        </label>

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

                        <small>
                            Cost of one JL in Kenyan
                            Shillings.
                        </small>

                    </div>


                    {/* DEPLOYMENT COST */}

                    <div className="form-group">

                        <label>
                            Deployment Cost — JL
                        </label>

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

                        <small>
                            JL charged when a deployment
                            is created.
                        </small>

                    </div>


                    {/* WELCOME BONUS */}

                    <div className="form-group">

                        <label>
                            Welcome Bonus — JL
                        </label>

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

                        <small>
                            JL automatically given to
                            eligible new accounts.
                        </small>

                    </div>


                    <button
                        type="submit"
                        disabled={saving}
                    >

                        {saving
                            ? "Saving..."
                            : "Save JL Settings"
                        }

                    </button>

                </form>

            </div>


            {/* FUTURE ADMIN MODULES */}

            <div className="dashboard-card">

                <h2>
                    Administration Modules
                </h2>

                <p>
                    More administrative controls will
                    be added here as the JLEY-XMD
                    management system expands.
                </p>

                <ul>

                    <li>
                        User management
                    </li>

                    <li>
                        Wallet management
                    </li>

                    <li>
                        JL transaction management
                    </li>

                    <li>
                        Deployment management
                    </li>

                    <li>
                        Bot monitoring
                    </li>

                    <li>
                        System logs
                    </li>

                    <li>
                        Release Center
                    </li>

                </ul>

            </div>

        </section>

    );

}