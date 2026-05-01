"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/projects")
        .then((res) => res.json())
        .then((data) => {
          setProjects(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch projects", err);
          setLoading(false);
        });
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        Loading...
      </div>
    );
  }

  if (!session) return null;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main className="container" style={{ flex: 1, paddingBottom: "4rem" }}>
        <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Dashboard</h1>
          <Link href="/projects" className="btn btn-primary">
            Manage Projects
          </Link>
        </header>

        <section style={{ marginBottom: "3rem" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Your Projects</h2>
          {projects.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>You aren't a part of any projects yet.</p>
              <Link href="/projects" className="btn btn-primary">Create your first project</Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
              {projects.map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id} className="card" style={{ display: "block", textDecoration: "none" }}>
                  <h3 style={{ fontSize: "1.25rem", marginBottom: "0.5rem", color: "var(--text-primary)" }}>{project.name}</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {project.description || "No description"}
                  </p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.875rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem" }}>
                    <span>{project.members.length} Members</span>
                    <span>{project._count.tasks} Tasks</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
