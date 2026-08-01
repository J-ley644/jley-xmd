import Background from "./Background";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({

    user,

    balance,

    current,

    onNavigate,

    children

}) {

    return (

        <>

            <Background />

            <Sidebar

                current={current}

                onChange={onNavigate}

            />

            <main className="main-content">

                <Navbar

                    user={user}

                    balance={balance}

                />

                {children}

            </main>

        </>

    );

}