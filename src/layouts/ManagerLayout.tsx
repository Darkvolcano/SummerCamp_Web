import Sidebar from "../components/sidebar/Manager/ManagerSidebar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <main className="flex-1" style={{ backgroundColor: "#EDF0FB" }}>
        {children}
      </main>
    </div>
  );
}
