import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminLayout({
    user,
    current,
    onNavigate,
    onLogout,
    children
}) {

    return (
        <div className="admin-layout">

            <AdminSidebar
                current={current}
                onChange={onNavigate}
                onLogout={onLogout}
            />

            <main className="admin-main">

                <AdminNavbar
                    user={user}
                    current={current}
                />

                <div className="admin-content">
                    {children}
                </div>

            </main>

        </div>
    );
}