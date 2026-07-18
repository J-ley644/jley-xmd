import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">

      <h2 className="logo">
        JLEY-XMD
      </h2>

      <nav>

        <Link to="/">
          🏠 Dashboard
        </Link>

        <Link to="/deployments">
          🚀 Deployments
        </Link>

        <Link to="/wallet">
          💰 JL Wallet
        </Link>

        <Link to="/settings">
          ⚙ Settings
        </Link>

      </nav>

    </aside>
  );
}

export default Sidebar;