import { useEffect, useState } from "react";

import {
    apiGet,
    apiPut
} from "../../services/api";


export default function SystemSettings() {

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

            const data = await apiGet(
                "/api/admin/settings/jl"
            );

            const value =
                data?.settings || {};

            setSettings({
                jlRateKES:
                    value.jlRateKES ?? "",

                deploymentCost:
                    value.deploymentCost ?? "",

                welcomeBonus:
                    value.welcomeBonus ?? ""
            });

        } catch (error) {

            console.error(
                "Settings loading error:",
                error
            );

            setError(
                error.message ||
                "Failed to load system settings."
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


    async function saveSettings() {

        try {

            setSaving(true);
            setError("");
            setMessage("");

            const data = await apiPut(
                "/api/admin/settings/jl",
                {
                    jlRateKES:
                        Number(settings.jlRateKES),

                    deploymentCost:
                        Number(settings.deploymentCost),

                    welcomeBonus:
                        Number(settings.welcomeBonus)
                }
            );

            const value =
                data?.settings || {};

            setSettings({
                jlRateKES:
                    value.jlRateKES ?? "",

                deploymentCost:
                    value.deploymentCost ?? "",

                welcomeBonus:
                    value.welcomeBonus ?? ""
            });

            setMessage(
                "JL settings updated successfully."
            );

        } catch (error) {

            console.error(
                "Settings save error:",
                error
            );

            setError(
                error.message ||
                "Failed to save settings."
            );

        } finally {

            setSaving(false);

        }

    }


    if (loading) {

        return (
            <section className="admin-page">

                <div className="admin-card">

                    <p>
                        Loading system settings...
                    </p>

                </div>

            </section>
        );

    }


    return (

        <section className="admin-page">

            <div className="admin-page-header">

                <div>

                    <h1>
                        System Settings
                    </h1>

                    <p>
                        Configure JLEY-XMD system and JL economy settings.
                    </p>

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


            <div className="admin-card">

                <h2>
                    JL Economy
                </h2>


                <div className="admin-form-grid">

                    <div className="admin-form-group">

                        <label>
                            JL Rate (KES)
                        </label>

                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={settings.jlRateKES}
                            onChange={e =>
                                updateField(
                                    "jlRateKES",
                                    e.target.value
                                )
                            }
                        />

                        <small>
                            KES price of 1 JL.
                        </small>

                    </div>


                    <div className="admin-form-group">

                        <label>
                            Deployment Cost (JL)
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={settings.deploymentCost}
                            onChange={e =>
                                updateField(
                                    "deploymentCost",
                                    e.target.value
                                )
                            }
                        />

                        <small>
                            JL charged for a bot deployment.
                        </small>

                    </div>


                    <div className="admin-form-group">

                        <label>
                            Welcome Bonus (JL)
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={settings.welcomeBonus}
                            onChange={e =>
                                updateField(
                                    "welcomeBonus",
                                    e.target.value
                                )
                            }
                        />

                        <small>
                            JL given to newly registered users.
                        </small>

                    </div>

                </div>


                <button
                    className="admin-primary-btn"
                    onClick={saveSettings}
                    disabled={saving}
                >
                    {saving
                        ? "Saving..."
                        : "Save Settings"}
                </button>

            </div>

        </section>

    );

}