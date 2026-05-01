"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";

export default function ProjectDetails({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks"); // tasks or members

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchProject = () => {
    fetch(`/api/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setProject(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        router.push("/projects");
      });
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchProject();
    }
  }, [status, projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTaskTitle, description: newTaskDesc }),
      });
      if (res.ok) {
        setShowTaskModal(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        fetchProject();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail, role: "MEMBER" }),
      });
      if (res.ok) {
        setShowMemberModal(false);
        setNewMemberEmail("");
        fetchProject();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchProject();
      else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchProject();
      else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>;
  if (!project) return null;

  const isAdmin = project.members.some((m: any) => m.userId === session?.user?.id && m.role === "ADMIN");

  const pendingTasks = project.tasks.filter((t: any) => t.status === "PENDING");
  const inProgressTasks = project.tasks.filter((t: any) => t.status === "IN_PROGRESS");
  const completedTasks = project.tasks.filter((t: any) => t.status === "COMPLETED");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main className="container" style={{ flex: 1, paddingBottom: "4rem" }}>
        <header style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>{project.name}</h1>
          <p style={{ color: "var(--text-secondary)" }}>{project.description}</p>
        </header>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)" }}>
          <button 
            onClick={() => setActiveTab("tasks")} 
            style={{ padding: "0.75rem 1rem", borderBottom: activeTab === "tasks" ? "2px solid var(--accent-primary)" : "none", color: activeTab === "tasks" ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: activeTab === "tasks" ? 600 : 400, background: "none" }}
          >
            Tasks Board
          </button>
          <button 
            onClick={() => setActiveTab("members")} 
            style={{ padding: "0.75rem 1rem", borderBottom: activeTab === "members" ? "2px solid var(--accent-primary)" : "none", color: activeTab === "members" ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: activeTab === "members" ? 600 : 400, background: "none" }}
          >
            Team Members
          </button>
        </div>

        {activeTab === "tasks" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>Task Board</h2>
              <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>+ New Task</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", alignItems: "start" }}>
              {/* To Do Column */}
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                  <span>To Do</span>
                  <span style={{ backgroundColor: "var(--bg-tertiary)", padding: "0.1rem 0.5rem", borderRadius: "50px", fontSize: "0.8rem" }}>{pendingTasks.length}</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {pendingTasks.map((task: any) => (
                    <div key={task.id} className="card" style={{ padding: "1rem" }}>
                      <h4 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{task.title}</h4>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>{task.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                        <button onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>Start</button>
                        {isAdmin && <button onClick={() => handleDeleteTask(task.id)} style={{ color: "#ef4444", background: "none", fontSize: "0.75rem", padding: "0.25rem" }}>Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                  <span>In Progress</span>
                  <span style={{ backgroundColor: "var(--bg-tertiary)", padding: "0.1rem 0.5rem", borderRadius: "50px", fontSize: "0.8rem" }}>{inProgressTasks.length}</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {inProgressTasks.map((task: any) => (
                    <div key={task.id} className="card" style={{ padding: "1rem", borderLeft: "3px solid var(--status-progress)" }}>
                      <h4 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{task.title}</h4>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>{task.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                        <button onClick={() => handleUpdateTaskStatus(task.id, "COMPLETED")} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", backgroundColor: "var(--status-completed)", color: "white", border: "none" }}>Complete</button>
                        {isAdmin && <button onClick={() => handleDeleteTask(task.id)} style={{ color: "#ef4444", background: "none", fontSize: "0.75rem", padding: "0.25rem" }}>Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Column */}
              <div style={{ backgroundColor: "var(--bg-secondary)", padding: "1rem", borderRadius: "var(--radius-md)" }}>
                <h3 style={{ fontSize: "1rem", marginBottom: "1rem", display: "flex", justifyContent: "space-between" }}>
                  <span>Completed</span>
                  <span style={{ backgroundColor: "var(--bg-tertiary)", padding: "0.1rem 0.5rem", borderRadius: "50px", fontSize: "0.8rem" }}>{completedTasks.length}</span>
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {completedTasks.map((task: any) => (
                    <div key={task.id} className="card" style={{ padding: "1rem", borderLeft: "3px solid var(--status-completed)", opacity: 0.7 }}>
                      <h4 style={{ fontWeight: 600, marginBottom: "0.5rem", textDecoration: "line-through" }}>{task.title}</h4>
                      <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>{task.description}</p>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                        <button onClick={() => handleUpdateTaskStatus(task.id, "PENDING")} className="btn btn-secondary" style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}>Reopen</button>
                        {isAdmin && <button onClick={() => handleDeleteTask(task.id)} style={{ color: "#ef4444", background: "none", fontSize: "0.75rem", padding: "0.25rem" }}>Delete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "members" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem" }}>Team Members</h2>
              {isAdmin && <button className="btn btn-primary" onClick={() => setShowMemberModal(true)}>+ Add Member</button>}
            </div>
            
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)" }}>
                    <th style={{ padding: "1rem", fontWeight: 600 }}>Name</th>
                    <th style={{ padding: "1rem", fontWeight: 600 }}>Email</th>
                    <th style={{ padding: "1rem", fontWeight: 600 }}>Role</th>
                    {isAdmin && <th style={{ padding: "1rem", fontWeight: 600, textAlign: "right" }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {project.members.map((member: any) => (
                    <tr key={member.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "1rem" }}>{member.user.name}</td>
                      <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{member.user.email}</td>
                      <td style={{ padding: "1rem" }}>
                        <span style={{ padding: "0.25rem 0.75rem", backgroundColor: member.role === "ADMIN" ? "rgba(59, 130, 246, 0.2)" : "var(--bg-tertiary)", color: member.role === "ADMIN" ? "var(--accent-primary)" : "var(--text-primary)", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 600 }}>
                          {member.role}
                        </span>
                      </td>
                      {isAdmin && (
                        <td style={{ padding: "1rem", textAlign: "right" }}>
                          {member.userId !== session?.user?.id && (
                            <button onClick={() => handleRemoveMember(member.userId)} style={{ color: "#ef4444", background: "none", fontSize: "0.875rem" }}>Remove</button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Task Modal */}
        {showTaskModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Create New Task</h2>
              <form onSubmit={handleCreateTask} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Task Title</label>
                  <input type="text" className="input" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Description</label>
                  <textarea className="input" rows={3} value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Member Modal */}
        {showMemberModal && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div className="card" style={{ width: "100%", maxWidth: "500px" }}>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem" }}>Add Team Member</h2>
              <form onSubmit={handleAddMember} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>User Email</label>
                  <input type="email" className="input" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} required />
                </div>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
