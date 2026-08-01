export default function Deployments({

    deployments,

    onPair,

    onPairCode,

    onStop,

    botName,

    setBotName,

    deployBot,

    deploying

}) {

    return (

        <div>


            <div className="create-deployment">


                <h2>

                    🚀 Deploy New Bot

                </h2>


                <input

                    placeholder="Bot name"

                    value={botName}

                    onChange={
                        e => setBotName(e.target.value)
                    }

                />


                <button

                    onClick={deployBot}

                    disabled={deploying}

                >

                    {
                        deploying
                        ? "Deploying..."
                        : "Create Deployment"
                    }

                </button>


            </div>





            <div className="deployment-grid">


                {
                    deployments.map(bot => (

                        <div

                            key={bot.id}

                            className="deployment-card"

                        >


                            <div className="deployment-header">


                                <div>

                                    <h2>

                                        🤖 {bot.botName}

                                    </h2>


                                    <small>

                                        {bot.id.slice(0, 8)}

                                    </small>


                                </div>



                                <span

                                    className={
                                        bot.connectionStatus === "CONNECTED"
                                        ? "status connected"
                                        : "status offline"
                                    }

                                >

                                    {
                                        bot.connectionStatus ||
                                        "OFFLINE"
                                    }


                                </span>


                            </div>





                            <div className="deployment-info">

                                <p>
                                    Deployment Status
                                </p>


                                <strong>

                                    {bot.status}

                                </strong>


                            </div>





                            <div className="deployment-info">


                                <p>
                                    Connection
                                </p>


                                <div className="connection-row">


                                    <span

                                        className={
                                            bot.connectionStatus === "CONNECTED"
                                            ? "live-dot"
                                            : "dead-dot"
                                        }

                                    />


                                    <strong>

                                        {
                                            bot.connectionStatus ||
                                            "OFFLINE"
                                        }

                                    </strong>


                                </div>


                            </div>





                            <div className="deployment-info">


                                <p>
                                    Session
                                </p>


                                <strong>

                                    {
                                        bot.sessionReady
                                        ? "Ready"
                                        : "Not Paired"
                                    }


                                </strong>


                            </div>





                            <div className="deployment-info">


                                <p>
                                    Last Connected
                                </p>


                                <strong>


                                    {
                                        bot.lastConnected

                                        ? new Date(
                                            bot.lastConnected
                                        ).toLocaleString()

                                        : "Never"
                                    }


                                </strong>


                            </div>





                            <div className="deployment-actions">


                                <button

                                    onClick={() =>
                                        onPair(bot.id)
                                    }

                                >

                                    📷 QR Pair

                                </button>




                                <button

                                    onClick={() =>
                                        onPairCode(bot.id)
                                    }

                                >

                                    📱 Phone Pair

                                </button>




                                <button

                                    onClick={() =>
                                        onStop(bot.id)
                                    }

                                >

                                    ⛔ Stop

                                </button>



                            </div>


                        </div>


                    ))
                }


            </div>


        </div>


    );

}