"use client";

import AdminSidebar from "@/components/admin/partials/sidebar"; 
import AdminHeader from "@/components/admin/partials/header";

export default function AdminLayout({ children }) {
  return (
     <div className="d-flex" style={{ height: "100vh", overflow: "hidden" }}>
      {/* Sidebar cố định */}
      <AdminSidebar />

      {/* Phần bên phải gồm Header cố định + main cuộn */}
      <div className="flex-grow-1 d-flex flex-column">
        {/* Header cố định */}
        <AdminHeader />

        {/* Main cuộn riêng */}
        <main
          className="flex-grow-1 p-4"
          style={{ overflowY: "auto", backgroundColor: "#f8f9fa" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}