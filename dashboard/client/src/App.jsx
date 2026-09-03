import { useEffect, useState } from "react";

import {
    apiGet,
    apiPost,
    saveToken,
    getToken,
    clearToken
} from "./services/api";

import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Deployments from "./pages/Deployments";
import Admin from "./pages/Admin";
import AdminApp from "./admin/AdminApp";


function ComingSoon({ title, icon }) {
    return (
        <section className="page-section">
            <div className="page-header">
                <div>
                    <h1>
                        {icon} {title}
                    </h1>

                    <p>
                        JLEY-XMD dashboard module
                    </p>
                </div>
            </div>

            <div className="dashboard-card">
                <h2>
                    {title}
                </h2>

                <p>
                    This section is being prepared.
                    The dashboard foundation is already connected
                    and this module will be added here.
                </p>
            </div>
        </section>
    );
}


function App() {
    const [mode, setMode] = useState("login");

    const [user, setUser] = useState(null);
    const [page, setPage] = useState("dashboard");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [botName, setBotName] = useState("");

    const [balance, setBalance] = useState(0);
    const [deployments, setDeployments] = useState([]);

    const [pairingId, setPairingId] = useState(null);
    const [qr, setQr] = useState(null);
    const [pairingCode, setPairingCode] = useState(null);

    const [loading, setLoading] = useState(false);
    const [deploying, setDeploying] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    useEffect(() => {
        const token = getToken();

        if (!token) {
            return;
        }

        loadDashboard();
    }, []);


    /*
     * PAIRING STATUS POLLING
     */
    useEffect(() => {
        if (!pairingId) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const data = await apiGet(
                    `/api/pairing/${pairingId}/status`
                );

                const deployment =
                    data?.deployment || data;

                if (data?.qr) {
                    setQr(data.qr);
                }

                if (data?.code) {
                    setPairingCode(data.code);
                }

                if (
                    deployment?.connectionStatus ===
                    "CONNECTED"
                ) {
                    setMessage(
                        "WhatsApp connected successfully."
                    );

                    setQr(null);
                    setPairingCode(null);
                    setPairingId(null);

                    await loadDeployments();
                }

            } catch (error) {
                console.error(
                    "Pairing polling error:",
                    error
                );
            }
        }, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [pairingId]);


    async function loadDashboard() {
        try {
            const me = await apiGet(
                "/api/auth/me"
            );

            setUser(me.user);

            await Promise.all([
                loadWallet(),
                loadDeployments()
            ]);

        } catch (error) {
            console.error(
                "Dashboard loading error:",
                error
            );

            clearToken();
            setUser(null);
        }
    }


    async function loadWallet() {
        try {
            const data = await apiGet(
                "/api/wallet"
            );

                        setBalance(
                data.wallet?.balance ?? 0
            );

        } catch (error) {
            console.error(
                "Wallet error:",
                error
            );
        }
    }


    async function loadDeployments() {
        try {
            const data = await apiGet(
                "/api/deployments"
            );

            setDeployments(
                data.deployments ||
                data ||
                []
            );

        } catch (error) {
            console.error(
                "Deployment error:",
                error
            );
        }
    }


    async function login() {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const data = await apiPost(
                "/api/auth/login",
                {
                    email,
                    password
                }
            );

            if (!data?.token) {
                throw new Error(
                    data?.message ||
                    "Login failed. No token received."
                );
            }

            saveToken(data.token);

            await loadDashboard();

        } catch (error) {
            console.error(
                "Login error:",
                error
            );

            setError(
                error.message ||
                "Login failed."
            );

        } finally {
            setLoading(false);
        }
    }


    async function register() {
        setLoading(true);
        setError("");
        setMessage("");

        try {
            await apiPost(
                "/api/auth/register",
                {
                    name,
                    email,
                    password
                }
            );

            setMessage(
                "Account created successfully."
            );

            setMode("login");

        } catch (error) {
            setError(
                error.message ||
                "Registration failed."
            );

        } finally {
            setLoading(false);
        }
    }


    function logout() {
        clearToken();

        setUser(null);
        setDeployments([]);
        setBalance(0);
        setPage("dashboard");

        setPairingId(null);
        setQr(null);
        setPairingCode(null);
    }


    async function deployBot() {
        if (!botName.trim()) {
            return;
        }

        setDeploying(true);
        setError("");
        setMessage("");

        try {
            const data = await apiPost(
                "/api/deployments",
                {
                    botName: botName.trim()
                }
            );

            setBotName("");

            if (data?.message) {
                setMessage(data.message);
            }

            await loadDeployments();
            await loadWallet();

        } catch (error) {
            console.error(
                "Deployment error:",
                error
            );

            setError(
                error.message ||
                "Deployment failed."
            );

        } finally {
            setDeploying(false);
        }
    }


    /*
     * QR PAIRING
     *
     * Uses the dedicated pairing API:
     * POST /api/pairing/:id/start
     */
    async function pairBot(id) {
        try {
            setError("");
            setMessage("");

            setPairingId(id);
            setPairingCode(null);
            setQr(null);

            const data = await apiPost(
                `/api/pairing/${id}/start`
            );

            if (data?.qr) {
                setQr(data.qr);
            }

            if (data?.code) {
                setPairingCode(data.code);
            }

            await loadDeployments();

        } catch (error) {
            console.error(
                "QR pairing error:",
                error
            );

            setPairingId(null);
            setQr(null);
            setPairingCode(null);

            setError(
                error.message ||
                "QR pairing failed."
            );
        }
    }


    /*
     * PHONE / PAIRING CODE
     *
     * Uses the dedicated pairing API:
     * POST /api/pairing/:id/code
     */
    async function pairPhone(id) {
        const phoneNumber = prompt(
            "Enter WhatsApp number with country code"
        );

        if (!phoneNumber) {
            return;
        }

        try {
            setError("");
            setMessage("");

            setPairingId(id);
            setQr(null);
            setPairingCode(null);

            const data = await apiPost(
                `/api/pairing/${id}/code`,
                {
                    phoneNumber: phoneNumber.trim()
                }
            );

            if (data?.code) {
                setPairingCode(data.code);
            }

            await loadDeployments();

        } catch (error) {
            console.error(
                "Phone pairing error:",
                error
            );

            setPairingId(null);
            setQr(null);
            setPairingCode(null);

            setError(
                error.message ||
                "Phone pairing failed."
            );
        }
    }


    async function stopBot(id) {
        setError("");
        setMessage("");

        try {
            await apiPost(
                `/api/deployments/${id}/stop`
            );

            await loadDeployments();

            setMessage(
                "Deployment stopped."
            );

        } catch (error) {
            console.error(
                "Stop bot error:",
                error
            );

            setError(
                error.message ||
                "Failed to stop bot."
            );
        }
    }


    /*
     * AUTH SCREEN
     */
    if (!user) {
        return (
            <div className="auth-container">

                <div className="auth-card">

                    <h1>
                        JLEY-XMD
                    </h1>

                    <p>
                        {
                            mode === "login"
                                ? "Sign in to continue"
                                : "Create your account"
                        }
                    </p>


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


                    {mode === "login" ? (
                        <>

                            <input
                                placeholder="Email"
                                value={email}
                                onChange={e =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                            />


                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />


                            <button
                                onClick={login}
                                disabled={loading}
                            >
                                {
                                    loading
                                        ? "Signing in..."
                                        : "Login"
                                }
                            </button>


                            <button
                                className="link-button"
                                onClick={() => {
                                    setMode("register");
                                    setError("");
                                    setMessage("");
                                }}
                            >
                                Create account
                            </button>

                        </>
                    ) : (
                        <>

                            <input
                                placeholder="Full Name"
                                value={name}
                                onChange={e =>
                                    setName(
                                        e.target.value
                                    )
                                }
                            />


                            <input
                                placeholder="Email"
                                value={email}
                                onChange={e =>
                                    setEmail(
                                        e.target.value
                                    )
                                }
                            />


                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={e =>
                                    setPassword(
                                        e.target.value
                                    )
                                }
                            />


                            <button
                                onClick={register}
                                disabled={loading}
                            >
                                {
                                    loading
                                        ? "Creating..."
                                        : "Register"
                                }
                            </button>


                            <button
                                className="link-button"
                                onClick={() => {
                                    setMode("login");
                                    setError("");
                                    setMessage("");
                                }}
                            >
                                Back to login
                            </button>

                        </>
                    )}

                </div>

            </div>
        );
    }


    /*
     * ADMIN
     */
    if (user.role === "ADMIN") {
        return (
            <AdminApp
                onLogout={logout}
            />
        );
    }


    /*
     * USER DASHBOARD
     */
    return (
        <DashboardLayout
            user={user}
            balance={balance}
            current={page}
            onNavigate={setPage}
            onLogout={logout}
        >

            {page === "dashboard" && (
                <Dashboard
                    deployments={deployments}
                    balance={balance}
                />
            )}


            {page === "deployments" && (
                <Deployments
                    deployments={deployments}
                    onPair={pairBot}
                    onPairCode={pairPhone}
                    onStop={stopBot}
                    botName={botName}
                    setBotName={setBotName}
                    deployBot={deployBot}
                    deploying={deploying}
                    pairingId={pairingId}
                    qr={qr}
                    pairingCode={pairingCode}
                />
            )}


            {page === "pairing" && (
    <section className="page-section">

        <div className="page-header">
            <div>
                <h1>📱 WhatsApp Pairing</h1>
                <p>
                    Connect a WhatsApp account to one of your JLEY-XMD bots.
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


        <div className="dashboard-card">

            <div className="card-header">
                <div>
                    <h2>Select a deployment</h2>
                    <p>
                        Choose the bot you want to connect to WhatsApp.
                    </p>
                </div>
            </div>


            {deployments.length === 0 ? (

                <div className="empty-state">
                    <h3>No deployments available</h3>

                    <p>
                        Create a deployment first, then return here
                        to connect WhatsApp.
                    </p>
                </div>

            ) : (

                <div className="deployment-cards">

                    {deployments.map((deployment) => {

                        const connected =
                            deployment.connectionStatus === "CONNECTED" ||
                            deployment.status === "RUNNING";

                        const selected =
                            pairingId === deployment.id;

                        return (
                            <div
                                className="dashboard-card deployment-card"
                                key={deployment.id}
                            >

                                <div className="deployment-card-header">

                                    <div>
                                        <h3>
                                            {deployment.botName || "JLEY Bot"}
                                        </h3>

                                        <span className="deployment-id">
                                            Deployment ID: {deployment.id}
                                        </span>
                                    </div>


                                    <span
                                        className={
                                            connected
                                                ? "status-badge status-online"
                                                : "status-badge status-offline"
                                        }
                                    >
                                        <span className="status-dot" />

                                        {connected
                                            ? "Connected"
                                            : "Not connected"}
                                    </span>

                                </div>


                                <div className="deployment-details">

                                    <div className="deployment-detail">
                                        <span>WhatsApp</span>

                                        <strong>
                                            {deployment.phoneNumber ||
                                                "Not paired"}
                                        </strong>
                                    </div>


                                    <div className="deployment-detail">
                                        <span>Connection</span>

                                        <strong>
                                            {deployment.connectionStatus ||
                                                "OFFLINE"}
                                        </strong>
                                    </div>

                                </div>


                                {!connected && (
                                    <div className="deployment-card-actions">

                                        <button
                                            className="primary-button"
                                            onClick={() =>
                                                pairBot(deployment.id)
                                            }
                                        >
                                            📷 Pair with QR
                                        </button>


                                        <button
                                            className="secondary-button"
                                            onClick={() =>
                                                pairPhone(deployment.id)
                                            }
                                        >
                                            🔢 Pair with Code
                                        </button>

                                    </div>
                                )}

                            </div>
                        );
                    })}

                </div>

            )}

        </div>


        {pairingId && (
            <div className="dashboard-card pairing-panel">

                <div className="card-header">

                    <div>
                        <h2>WhatsApp Pairing</h2>

                        <p>
                            Complete the connection using WhatsApp on your phone.
                        </p>
                    </div>

                    <span className="status-badge status-online">
                        <span className="status-dot" />
                        Waiting
                    </span>

                </div>


                <div className="pairing-content">

                    {qr ? (

                        <div className="qr-section">

                            <div className="qr-frame">
                                <img
                                    src={qr}
                                    alt="WhatsApp pairing QR code"
                                />
                            </div>

                            <h3>
                                Scan this QR code
                            </h3>

                            <p>
                                Open WhatsApp → Linked Devices →
                                Link a Device, then scan this QR code.
                            </p>

                        </div>

                    ) : pairingCode ? (

                        <div className="code-section">

                            <div className="pairing-code">
                                {pairingCode}
                            </div>

                            <h3>
                                WhatsApp pairing code
                            </h3>

                            <p>
                                Enter this code in WhatsApp when prompted
                                to link the device.
                            </p>

                        </div>

                    ) : (

                        <div className="pairing-loading">

                            <div className="loading-spinner" />

                            <h3>
                                Preparing WhatsApp connection...
                            </h3>

                            <p>
                                Waiting for pairing information.
                            </p>

                        </div>

                    )}

                </div>

            </div>
        )}

    </section>
)}

            {page === "plugins" && (
                <ComingSoon
                    title="Plugins"
                    icon="🧩"
                />
            )}


            {page === "testing" && (
                <ComingSoon
                    title="Bot Testing"
                    icon="🧪"
                />
            )}


            {page === "logs" && (
                <ComingSoon
                    title="Logs"
                    icon="📜"
                />
            )}


            {page === "wallet" && (
                <ComingSoon
                    title="JL Wallet"
                    icon="💰"
                />
            )}


            {page === "updates" && (
                <ComingSoon
                    title="Updates"
                    icon="🔔"
                />
            )}


            {page === "settings" && (
                <ComingSoon
                    title="Settings"
                    icon="⚙️"
                />
            )}


            {page === "admin" && (
                user?.role === "ADMIN"
                    ? (
                        <Admin
                            user={user}
                        />
                    )
                    : (
                        <ComingSoon
                            title="Access Denied"
                            icon="🛡️"
                        />
                    )
            )}

        </DashboardLayout>
    );
}


export default App;