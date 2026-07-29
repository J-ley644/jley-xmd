
function StatCard({
    title,
    value,
    icon,
    description
}) {

    return (

        <article className="stat-card">

            <div className="stat-card-top">

                <div className="stat-icon">
                    {icon}
                </div>

                <span className="stat-indicator">
                    ●
                </span>

            </div>


            <div className="stat-card-body">

                <span className="stat-title">
                    {title}
                </span>

                <strong className="stat-value">
                    {value}
                </strong>

                <span className="stat-description">
                    {description}
                </span>

            </div>

        </article>

    );

}

export default StatCard;

