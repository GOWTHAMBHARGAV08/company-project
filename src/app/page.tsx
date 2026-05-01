"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{ padding: "2rem 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          <span className="text-gradient">Task</span>Flow
        </div>
        <nav>
          {status === "authenticated" ? (
            <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
          ) : (
            <div style={{ display: "flex", gap: "1rem" }}>
              <Link href="/login" className="btn btn-secondary">Log In</Link>
              <Link href="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}
        </nav>
      </header>

      <main style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "4rem 0" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: "800", lineHeight: 1.1, marginBottom: "1.5rem", letterSpacing: "-0.05em" }}>
          Manage your projects<br />
          with <span className="text-gradient">absolute clarity.</span>
        </h1>
        <p style={{ fontSize: "1.25rem", color: "var(--text-secondary)", maxWidth: "600px", marginBottom: "3rem" }}>
          TaskFlow is the ultimate team collaboration tool designed to streamline workflows, enforce role-based access, and boost productivity.
        </p>
        
        {status === "authenticated" ? (
          <Link href="/dashboard" className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.125rem", borderRadius: "50px" }}>
            Open Dashboard
          </Link>
        ) : (
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/register" className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.125rem", borderRadius: "50px" }}>
              Start for free
            </Link>
          </div>
        )}

        <div style={{ marginTop: "5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", width: "100%" }}>
          <div className="card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--text-primary)" }}>Role-Based Access</h3>
            <p style={{ color: "var(--text-secondary)" }}>Securely manage your team with granular permissions. Assign Admin and Member roles to ensure the right access levels.</p>
          </div>
          <div className="card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--text-primary)" }}>Task Tracking</h3>
            <p style={{ color: "var(--text-secondary)" }}>Create, assign, and track tasks seamlessly. Keep everyone on the same page with real-time status updates.</p>
          </div>
          <div className="card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "var(--text-primary)" }}>Project Dashboard</h3>
            <p style={{ color: "var(--text-secondary)" }}>Get a bird's-eye view of all your projects. Highlight overdue tasks and filter by status with a sleek, modern UI.</p>
          </div>
        </div>
      </main>

      <footer style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", marginTop: "auto" }}>
        <p>&copy; {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}
