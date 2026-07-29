function Navbar() {

    const storedUser =
        localStorage.getItem("adminUser");

    let user = null;

    try {

        user = storedUser
            ? JSON.parse(storedUser)
            : null;

    } catch {

        user = null;

    }

    return (

        <header className="admin-navbar">

            <div>

                <h1>Administration</h1>

                <p>
                    JLEY-XMD control centre
                </p>

            </div>

            <div className="admin-user">

                <strong>
                    {user?.name || "Administrator"}
                </strong>

                <span>
                    {user?.email || ""}
                </span>

            </div>

        </header>

    );

}

export default Navbar;
