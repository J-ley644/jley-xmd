function DashboardLayout({ children }) {
  return (
    <div>
      <header>
        <h2>JLEY-XMD Dashboard</h2>
      </header>

      <main>
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;