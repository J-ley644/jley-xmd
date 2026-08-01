export default function Dashboard({

    deployments,

    balance

}) {

    const connected =
        deployments.filter(

            d =>
                d.connectionStatus ===
                "CONNECTED"

        ).length;

    return (

        <>

            <div className="stats-grid">

                <div className="stat-card">

                    <span>🤖</span>

                    <h2>

                        {deployments.length}

                    </h2>

                    <p>

                        Deployments

                    </p>

                </div>

                <div className="stat-card">

                    <span>💰</span>

                    <h2>

                        {balance ?? 0}

                    </h2>

                    <p>

                        JL Balance

                    </p>

                </div>

                <div className="stat-card">

                    <span>🟢</span>

                    <h2>

                        {connected}

                    </h2>

                    <p>

                        Connected

                    </p>

                </div>

                <div className="stat-card">

                    <span>⚡</span>

                    <h2>

                        {

                            deployments.filter(

                                d =>
                                    d.status ===
                                    "RUNNING"

                            ).length

                        }

                    </h2>

                    <p>

                        Running

                    </p>

                </div>

            </div>

        </>

    );

}