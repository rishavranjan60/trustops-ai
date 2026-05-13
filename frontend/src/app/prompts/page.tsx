"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createPrompt,
  deletePrompt,
  getPromptsByProject,
  getProjects,
  Project,
  Prompt,
} from "@/lib/api";

export default function PromptsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [modelName, setModelName] = useState("gpt-4o-mini");
  const [temperature, setTemperature] = useState("0.3");
  const [version, setVersion] = useState("v1");

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

      if (data.length > 0) {
        const firstProjectId = data[0].id;
        setSelectedProjectId(String(firstProjectId));
        await loadPrompts(firstProjectId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function loadPrompts(projectId: number) {
    setError("");

    try {
      const data = await getPromptsByProject(projectId);
      setPrompts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load prompts");
    }
  }

  async function handleProjectChange(projectId: string) {
    setSelectedProjectId(projectId);

    if (projectId) {
      await loadPrompts(Number(projectId));
    } else {
      setPrompts([]);
    }
  }

  async function handleCreatePrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProjectId) {
      setError("Please select a project first");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const prompt = await createPrompt({
        project_id: Number(selectedProjectId),
        name,
        system_prompt: systemPrompt,
        user_prompt: userPrompt,
        model_name: modelName,
        temperature: Number(temperature),
        version,
      });

      setPrompts((prev) => [prompt, ...prev]);

      setName("");
      setSystemPrompt("");
      setUserPrompt("");
      setModelName("gpt-4o-mini");
      setTemperature("0.3");
      setVersion("v1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create prompt");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeletePrompt(promptId: number) {
    setError("");

    try {
      await deletePrompt(promptId);
      setPrompts((prev) => prev.filter((prompt) => prompt.id !== promptId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete prompt");
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
            <h1 className="text-3xl font-bold">Prompts</h1>
            <p className="mt-2 text-slate-400">
              Create and manage prompt versions for LLM evaluation.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/datasets")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Datasets
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Dashboard
            </button>
          </div>
        </div>

        {loading ? (
          <p className="mt-8 text-slate-400">Loading...</p>
        ) : projects.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-8 text-center">
            <p className="text-slate-300">No project found.</p>
            <p className="mt-2 text-sm text-slate-500">
              Create a project first before adding prompts.
            </p>

            <button
              onClick={() => router.push("/projects")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[430px_1fr]">
            <form
              onSubmit={handleCreatePrompt}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-xl font-semibold">Create prompt</h2>

              <div className="mt-5">
                <label className="text-sm text-slate-300">Project</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  value={selectedProjectId}
                  onChange={(event) => handleProjectChange(event.target.value)}
                  required
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <label className="text-sm text-slate-300">Prompt name</label>
                <input
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Helpful Support Assistant"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="mt-5">
                <label className="text-sm text-slate-300">System prompt</label>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="You are a helpful customer support assistant."
                  value={systemPrompt}
                  onChange={(event) => setSystemPrompt(event.target.value)}
                />
              </div>

              <div className="mt-5">
                <label className="text-sm text-slate-300">User prompt</label>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Answer the customer's question using simple language."
                  value={userPrompt}
                  onChange={(event) => setUserPrompt(event.target.value)}
                  required
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm text-slate-300">Model</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    value={modelName}
                    onChange={(event) => setModelName(event.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Temperature</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    value={temperature}
                    onChange={(event) => setTemperature(event.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Version</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    value={version}
                    onChange={(event) => setVersion(event.target.value)}
                  />
                </div>
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
                {creating ? "Creating..." : "Create prompt"}
              </button>
            </form>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Prompt versions</h2>

              {prompts.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                  <p className="text-slate-300">No prompts yet.</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Add your first prompt for LLM evaluation.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {prompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {prompt.name}
                            </h3>

                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                              {prompt.version || "v1"}
                            </span>

                            <span className="rounded-full bg-blue-950 px-3 py-1 text-xs text-blue-300">
                              {prompt.model_name || "model"}
                            </span>

                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                              temp {prompt.temperature ?? 0.7}
                            </span>
                          </div>

                          {prompt.system_prompt && (
                            <>
                              <p className="mt-4 text-sm font-semibold text-purple-300">
                                System prompt
                              </p>
                              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">
                                {prompt.system_prompt}
                              </p>
                            </>
                          )}

                          <p className="mt-4 text-sm font-semibold text-green-300">
                            User prompt
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">
                            {prompt.user_prompt}
                          </p>

                          <p className="mt-4 text-xs text-slate-500">
                            Created:{" "}
                            {new Date(prompt.created_at).toLocaleString()}
                          </p>
                        </div>

                        <button
                          onClick={() => handleDeletePrompt(prompt.id)}
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
        )}
      </div>
    </main>
  );
}