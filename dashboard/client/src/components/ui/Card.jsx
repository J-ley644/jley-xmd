export default function Card({

    title,

    children

}){

    return(

        <div className="glass-card">

            {title && (

                <h3>

                    {title}

                </h3>

            )}

            {children}

        </div>

    );

}