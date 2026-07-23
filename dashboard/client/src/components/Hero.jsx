import "./Hero.css";

function Hero() {
    return (
        <section className="hero">

            <div className="hero-left">

                <span className="badge">
                    🚀 Next Generation WhatsApp Platform
                </span>

                <h1>
                    Deploy Your
                    <span> WhatsApp Bots</span>
                    <br />
                    In Seconds
                </h1>

                <p>
                    JLEY-XMD makes deploying, managing and monitoring
                    WhatsApp bots simple, fast and reliable.
                </p>

                <div className="hero-buttons">

                    <button className="primary-btn">
                        Deploy Bot
                    </button>

                    <button className="secondary-btn">
                        Documentation
                    </button>

                </div>

            </div>

            <div className="hero-right">

                <div className="hero-card">

                    <h3>Platform Status</h3>

                    <div className="status">
                        <span className="dot"></span>
                        Online
                    </div>

                    <div className="mini-stats">

                        <div>
                            <h2>0</h2>
                            <p>Active Bots</p>
                        </div>

                        <div>
                            <h2>0</h2>
                            <p>Deployments</p>
                        </div>

                        <div>
                            <h2>100%</h2>
                            <p>Uptime</p>
                        </div>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default Hero;