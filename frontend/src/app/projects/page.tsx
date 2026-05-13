"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProject,
  deleteProject,
  getProjects,
  Project,
} from "@/lib/api";

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    setError("");

    try {
      const token = localStorage.getItem("trustops_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getProjects();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreating(true);
    setError("");

    try {
      const project = await createProject({
        name,
        description,
      });

      setProjects((prev) => [project, ...prev]);
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteProject(projectId: number) {
    setError("");

    try {
      await deleteProject(projectId);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="mt-2 text-slate-400">
              Create and manage AI evaluation projects.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Back to dashboard
          </button>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
          <form
            onSubmit={handleCreateProject}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
          >
            <h2 className="text-xl font-semibold">Create new project</h2>

            <div className="mt-5">
              <label className="text-sm text-slate-300">Project name</label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Customer Support LLM Evaluation"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>

            <div className="mt-5">
              <label className="text-sm text-slate-300">Description</label>
              <textarea
                className="mt-2 min-h-32 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                placeholder="Evaluate hallucination, helpfulness, safety, latency, and cost."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {error && (
              <div className="mt-5 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={creating}
              className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create project"}
            </button>
          </form>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Your projects</h2>

            {loading ? (
              <p className="mt-6 text-slate-400">Loading projects...</p>
            ) : projects.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                <p className="text-slate-300">No projects yet.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Create your first TrustOps AI project from the form.
                </p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {project.name}
                        </h3>

                        <p className="mt-2 text-sm text-slate-400">
                          {project.description || "No description provided."}
                        </p>

                        <p className="mt-3 text-xs text-slate-500">
                          Created:{" "}
                          {new Date(project.created_at).toLocaleString()}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-300 hover:bg-red-950"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}