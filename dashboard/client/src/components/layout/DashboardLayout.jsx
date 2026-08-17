import { useState } from "react";

import Background from "./Background";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";


export default function DashboardLayout({

    user,
    balance,
    current,
    onNavigate,
    onLogout,
    children

}) {

    const [mobileOpen, setMobileOpen] =
        useState(false);


    function handleNavigate(page) {

        onNavigate(page);

        setMobileOpen(false);

    }


    return (

        <>

            <Background />


            {/* MOBILE MENU BUTTON */}

            <button
                className="mobile-menu-btn"
                onClick={() =>
                    setMobileOpen(true)
                }
                aria-label="Open navigation"
            >
                ☰
            </button>


            {/* MOBILE OVERLAY */}

            {mobileOpen && (

                <div
                    className="mobile-overlay"
                    onClick={() =>
                        setMobileOpen(false)
                    }
                />

            )}


            {/* SIDEBAR */}

            <Sidebar
                current={current}
                onChange={handleNavigate}
                mobileOpen={mobileOpen}
                onClose={() =>
                    setMobileOpen(false)
                }
                onLogout={onLogout}
                user={user}
            />


            {/* MAIN */}

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