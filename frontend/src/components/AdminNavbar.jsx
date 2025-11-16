import React from "react";
import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <nav
      style={{
        width: "100%",
        padding: "15px 20px",
        background: "#111",
        color: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <h2 style={{ margin: 0 }}>Admin Dashboard</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>
          Home
        </Link>

        <Link
          to="/admin/products"
          style={{ color: "white", textDecoration: "none" }}
        >
          Products
        </Link>

        <Link
          to="/admin/gallery"
          style={{ color: "white", textDecoration: "none" }}
        >
          Gallery
        </Link>

        <Link
          to="/admin/orders"
          style={{ color: "white", textDecoration: "none" }}
        >
          Orders
        </Link>
      </div>
    </nav>
  );
}
