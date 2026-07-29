
import "./Stats.css";

function Stats({ stats = {} }) {

    const cards = [

        {
            title: "Active Bots",
            value: stats.activeBots ?? 0,
            icon: "🤖"
        },

        {
            title: "Deployments",
            value: stats.deployments ?? 0,
            icon: "🚀"
        },

        {
            title: "JL Wallet",
            value: `${stats.jlBalance ?? 0} JL`,
            icon: "💎"
        },

        {
            title: "Connected",
            value: stats.connectedBots ?? 0,
            icon: "⚡"
        }

    ];


    return (

        <section className="stats">

            {cards.map((card, index) => (

                <div
                    key={index}
                    className="stat-card"
                >

                    <div className="stat-icon">
                        {card.icon}
                    </div>

                    <h2>
                        {card.value}
                    </h2>

                    <p>
                        {card.title}
                    </p>

                </div>

            ))}

        </section>

    );

}

export default Stats;

