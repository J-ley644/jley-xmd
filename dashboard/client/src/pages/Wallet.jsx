import { useEffect, useState } from "react";

import {
    apiGet
} from "../services/api";


export default function Wallet({

    balance

}) {

    const [
        transactions,
        setTransactions
    ] = useState([]);

    const [
        loading,
        setLoading
    ] = useState(true);

    const [
        error,
        setError
    ] = useState("");


    useEffect(() => {

        loadTransactions();

    }, []);


    async function loadTransactions() {

        try {

            setLoading(true);

            setError("");


            const data =
                await apiGet(
                    "/api/wallet/transactions"
                );


            setTransactions(
                data.transactions ||
                []
            );

        } catch (error) {

            console.error(
                "Wallet transactions error:",
                error
            );


            setError(
                error.message ||
                "Failed to load transactions."
            );

        } finally {

            setLoading(false);

        }

    }


    function formatDate(date) {

        if (!date) {
            return "—";
        }


        return new Date(
            date
        ).toLocaleString();

    }


    function getTransactionLabel(
        transaction
    ) {

        if (
            transaction.type ===
            "ADMIN_CREDIT"
        ) {

            return "Admin Credit";

        }


        if (
            transaction.amount > 0
        ) {

            return "JL Credit";

        }


        return "JL Usage";

    }


    return (

        <section className="page-section">


            <div className="page-header">

                <div>

                    <h1>
                        💰 JL Wallet
                    </h1>

                    <p>
                        Manage your JLEY-XMD credits
                        and transaction history.
                    </p>

                </div>

            </div>


            {error && (

                <div className="error-box">

                    {error}

                </div>

            )}


            {/* WALLET BALANCE */}

            <div className="wallet-hero">


                <div className="wallet-hero-content">

                    <span className="wallet-label">

                        Available Balance

                    </span>


                    <h2>

                        {balance ?? 0}

                        <span>
                            JL
                        </span>

                    </h2>


                    <p>

                        JL credits are used for
                        JLEY-XMD services and
                        bot deployments.

                    </p>

                </div>


                <div className="wallet-hero-icon">

                    💰

                </div>


            </div>


            {/* BUY JL */}

            <div className="dashboard-card">

                <div className="card-header">

                    <div>

                        <h2>

                            Buy JL Credits

                        </h2>


                        <p>

                            Purchase JL credits to
                            deploy and manage your bots.

                        </p>

                    </div>


                    <span className="coming-soon-badge">

                        Payment Coming Soon

                    </span>

                </div>


                <div className="jl-packages">


                    <div className="jl-package">

                        <div>

                            <h3>

                                Starter

                            </h3>

                            <strong>

                                50 JL

                            </strong>

                        </div>


                        <p>

                            Good for getting started.

                        </p>


                        <button
                            disabled
                        >

                            Payment Coming Soon

                        </button>

                    </div>


                    <div className="jl-package featured-package">

                        <div>

                            <h3>

                                Popular

                            </h3>

                            <strong>

                                100 JL

                            </strong>

                        </div>


                        <p>

                            Great for multiple
                            deployments.

                        </p>


                        <button
                            disabled
                        >

                            Payment Coming Soon

                        </button>

                    </div>


                    <div className="jl-package">

                        <div>

                            <h3>

                                Business

                            </h3>

                            <strong>

                                500 JL

                            </strong>

                        </div>


                        <p>

                            Built for larger
                            JLEY-XMD usage.

                        </p>


                        <button
                            disabled
                        >

                            Payment Coming Soon

                        </button>

                    </div>


                </div>


                <div className="wallet-info-box">

                    <strong>

                        ℹ️ Payment System

                    </strong>


                    <p>

                        Automatic JL purchases
                        will be available after
                        payment gateway integration.

                        For now, JL credits can be
                        added to your account by
                        the JLEY-XMD administrator.

                    </p>

                </div>


            </div>


            {/* TRANSACTION HISTORY */}

            <div className="dashboard-card">

                <div className="card-header">

                    <div>

                        <h2>

                            Transaction History

                        </h2>


                        <p>

                            Track all JL credits
                            and usage.

                        </p>

                    </div>


                    <button
                        className="secondary-button"
                        onClick={
                            loadTransactions
                        }
                    >

                        Refresh

                    </button>

                </div>


                {loading ? (

                    <div className="empty-state">

                        <div className="loading-spinner" />

                        <p>

                            Loading transactions...

                        </p>

                    </div>

                ) : transactions.length === 0 ? (

                    <div className="empty-state">

                        <h3>

                            No transactions yet

                        </h3>


                        <p>

                            Your JL activity will
                            appear here.

                        </p>

                    </div>

                ) : (

                    <div className="transaction-list">


                        {transactions.map(
                            (transaction) => {

                                const isCredit =
                                    transaction.amount > 0;


                                return (

                                    <div
                                        className="transaction-item"
                                        key={
                                            transaction.id
                                        }
                                    >


                                        <div className="transaction-icon">

                                            {
                                                isCredit
                                                    ? "➕"
                                                    : "➖"
                                            }

                                        </div>


                                        <div className="transaction-main">

                                            <h3>

                                                {
                                                    getTransactionLabel(
                                                        transaction
                                                    )
                                                }

                                            </h3>


                                            <p>

                                                {
                                                    transaction.description ||
                                                    "JL transaction"
                                                }

                                            </p>


                                            <span>

                                                {
                                                    formatDate(
                                                        transaction.createdAt
                                                    )
                                                }

                                            </span>

                                        </div>


                                        <div
                                            className={
                                                isCredit
                                                    ? "transaction-amount credit"
                                                    : "transaction-amount debit"
                                            }
                                        >

                                            {
                                                isCredit
                                                    ? "+"
                                                    : ""
                                            }

                                            {
                                                transaction.amount
                                            }

                                            {" "}JL

                                        </div>


                                    </div>

                                );

                            }
                        )}


                    </div>

                )}


            </div>


        </section>

    );

}