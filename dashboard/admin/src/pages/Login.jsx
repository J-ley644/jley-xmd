import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/api";

function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    async function handleSubmit(e) {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response =
                await adminLogin(
                    email,
                    password
                );

            if (!response?.token) {
                throw new Error(
                    "Login succeeded but no authentication token was returned."
                );
            }

            if (response?.user?.role !== "ADMIN") {

                throw new Error(
                    "This account does not have administrator access."
                );

            }

            localStorage.setItem(
                "adminToken",
                response.token
            );

            localStorage.setItem(
                "adminRole",
                response.user.role
            );

            localStorage.setItem(
                "adminUser",
                JSON.stringify(response.user)
            );

            navigate("/", {
                replace: true
            });

        } catch (error) {

            console.error(
                "ADMIN LOGIN ERROR:",
                error
            );

            setError(
                error.message ||
                "Admin login failed."
            );

        } finally {

            setLoading(false);

        }

    }

    return (

        <main className="admin-login-page">

            <div className="admin-login-card">

                <div className="admin-login-header">

                    <div className="admin-logo">
                        J
                    </div>

                    <h1>
                        JLEY-XMD
                    </h1>

                    <p>
                        Administrator Dashboard
                    </p>

                </div>

                <form onSubmit={handleSubmit}>

                    {error && (

                        <div className="admin-login-error">
                            {error}
                        </div>

                    )}

                    <div className="admin-form-group">

                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            placeholder="Admin email"
                            autoComplete="email"
                            required
                        />

                    </div>

                    <div className="admin-form-group">

                        <label htmlFor="password">
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Signing in..."
                            : "Sign in as Admin"
                        }

                    </button>

                </form>

            </div>

        </main>

    );

}

export default Login;
