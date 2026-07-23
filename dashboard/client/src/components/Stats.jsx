import "./Stats.css";

const stats = [

    {
        title: "Active Bots",
        value: "0",
        icon: "🤖"
    },

    {
        title: "Deployments",
        value: "0",
        icon: "🚀"
    },

    {
        title: "JL Wallet",
        value: "0 JL",
        icon: "💎"
    },

    {
        title: "Platform Health",
        value: "100%",
        icon: "⚡"
    }

];

function Stats(){

    return(

        <section className="stats">

            {

                stats.map((card,index)=>(

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

                ))

            }

        </section>

    );

}

export default Stats;