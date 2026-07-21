import { NavLink } from "react-router-dom";


function Sidebar(){

    return (

        <aside className="sidebar">


            <div className="brand">

                JLEY-XMD

                <span>
                    Client Panel
                </span>

            </div>



            <nav>


                <NavLink to="/">
                    🏠 Dashboard
                </NavLink>


                <NavLink to="/deployments">
                    🤖 My Bots
                </NavLink>


                <NavLink to="/deploy">
                    🚀 Deploy Bot
                </NavLink>


                <NavLink to="/wallet">
                    💰 JL Wallet
                </NavLink>


                <NavLink to="/settings">
                    ⚙ Settings
                </NavLink>


            </nav>



            <div className="sidebar-footer">

                <p>
                    JL Credits
                </p>


                <h3>
                    0 JL
                </h3>


            </div>


        </aside>

    );

}


export default Sidebar;