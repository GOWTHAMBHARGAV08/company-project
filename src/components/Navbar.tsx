"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) return null;

  return (
    <nav style={{ padding: "1rem 0", borderBottom: "1px solid var(--border-color)", marginBottom: "2rem", backgroundColor: "var(--bg-secondary)" }}>
      <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <Link href="/dashboard" style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
            <span className="text-gradient">Task</span>Flow
          </Link>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link 
              href="/dashboard" 
              style={{ color: pathname === "/dashboard" ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: pathname === "/dashboard" ? 600 : 400 }}
            >
              Dashboard
            </Link>
            <Link 
              href="/projects" 
              style={{ color: pathname.startsWith("/projects") ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: pathname.startsWith("/projects") ? 600 : 400 }}
            >
              Projects
            </Link>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>{session.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="btn btn-secondary" style={{ fontSize: "0.875rem", padding: "0.4rem 0.8rem" }}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
