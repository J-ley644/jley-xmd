import { useEffect, useState } from "react";

import {
    apiGet,
    apiPut
} from "../../services/api";


export default function JLEconomy() {

    const [settings, setSettings] = useState({
        jlRateKES: "",
        deploymentCost: "",
        welcomeBonus: ""
    });

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");


    useEffect(() => {

        loadSettings();

    }, []);


    async function loadSettings() {

        try {

            setLoading(true);
            setError("");
            setMessage("");

            const data = await apiGet(
                "/api/admin/settings/jl"
            );

            const values =
                data?.settings || data;

            setSettings({
                jlRateKES:
                    values?.jlRateKES ?? "",

                deploymentCost:
                    values?.deploymentCost ?? "",

                welcomeBonus:
                    values?.welcomeBonus ?? ""
            });

        } catch (error) {

            console.error(
                "JL settings error:",
                error
            );

            setError(
                error.message ||
                "Failed to load JL settings."
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


    async function saveSettings(event) {

        event.preventDefault();

        setSaving(true);

        setError("");

        setMessage("");


        try {

            const data = await apiPut(
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
                data?.settings;


            if (values) {

                setSettings({

                    jlRateKES:
                        values.jlRateKES,

                    deploymentCost:
                        values.deploymentCost,

                    welcomeBonus:
                        values.welcomeBonus

                });

            }


            setMessage(
                data?.message ||
                "JL settings updated successfully."
            );

        } catch (error) {

            console.error(
                "Update JL settings error:",
                error
            );

            setError(
                error.message ||
                "Failed to update JL settings."
            );

        } finally {

            setSaving(false);

        }

    }


    if (loading) {

        return (

            <section className="admin-page">

                <div className="admin-page-header">

                    <div>

                        <h1>
                            JL Economy
                        </h1>

                        <p>
                            Loading economy settings...
                        </p>

                    </div>

                </div>

            </section>

        );

    }


    return (

        <section className="admin-page">

            <div className="admin-page-header">

                <div>

                    <h1>
                        JL Economy
                    </h1>

                    <p>
                        Control the JLEY-XMD credit economy.
                    </p>

                </div>

                <div className="admin-status">

                    <span className="status-dot" />

                    Economy Controls

                </div>

            </div>


            {error && (

                <div className="admin-error-box">
                    {error}
                </div>

            )}


            {message && (

                <div className="admin-success-box">
                    {message}
                </div>

            )}


            <div className="admin-economy-grid">

                <div className="admin-card">

                    <div className="admin-card-header">

                        <div>

                            <h2>
                                JL Configuration
                            </h2>

                            <p>
                                These values control the
                                platform's JL economy.
                            </p>

                        </div>

                    </div>


                    <form
                        onSubmit={saveSettings}
                        className="admin-form"
                    >

                        <div className="admin-form-group">

                            <label>
                                JL Rate
                            </label>

                            <span className="admin-form-help">
                                KES required for 1 JL
                            </span>

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={
                                    settings.jlRateKES
                                }
                                onChange={event =>
                                    updateField(
                                        "jlRateKES",
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="admin-form-group">

                            <label>
                                Deployment Cost
                            </label>

                            <span className="admin-form-help">
                                JL consumed when creating
                                a deployment
                            </span>

                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={
                                    settings.deploymentCost
                                }
                                onChange={event =>
                                    updateField(
                                        "deploymentCost",
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="admin-form-group">

                            <label>
                                Welcome Bonus
                            </label>

                            <span className="admin-form-help">
                                JL given to new accounts
                            </span>

                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={
                                    settings.welcomeBonus
                                }
                                onChange={event =>
                                    updateField(
                                        "welcomeBonus",
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="admin-form-actions">

                            <button
                                type="submit"
                                disabled={saving}
                                className="admin-primary-btn"
                            >
                                {saving
                                    ? "Saving..."
                                    : "Save JL Settings"}
                            </button>

                        </div>

                    </form>

                </div>


                <div className="admin-card">

                    <div className="admin-card-header">

                        <div>

                            <h2>
                                Current Economy
                            </h2>

                            <p>
                                Quick overview of the
                                configured values.
                            </p>

                        </div>

                    </div>


                    <div className="economy-summary">

                        <div className="economy-summary-item">

                            <span>
                                1 JL
                            </span>

                            <strong>
                                KES{" "}
                                {settings.jlRateKES}
                            </strong>

                        </div>


                        <div className="economy-summary-item">

                            <span>
                                Deployment
                            </span>

                            <strong>
                                {settings.deploymentCost} JL
                            </strong>

                        </div>


                        <div className="economy-summary-item">

                            <span>
                                Welcome Bonus
                            </span>

                            <strong>
                                {settings.welcomeBonus} JL
                            </strong>

                        </div>

                    </div>


                    <div className="admin-warning-box">

                        <strong>
                            Economy Control
                        </strong>

                        <p>
                            Changes made here affect the
                            platform's JL configuration.
                            Make sure values are correct
                            before saving.
                        </p>

                    </div>

                </div>

            </div>

        </section>

    );

}