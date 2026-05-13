"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createDataset,
  deleteDataset,
  getDatasetsByProject,
  getProjects,
  Dataset,
  Project,
} from "@/lib/api";

export default function DatasetsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [inputText, setInputText] = useState("");
  const [expectedOutput, setExpectedOutput] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

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
        await loadDatasets(firstProjectId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function loadDatasets(projectId: number) {
    setError("");

    try {
      const data = await getDatasetsByProject(projectId);
      setDatasets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load datasets");
    }
  }

  async function handleProjectChange(projectId: string) {
    setSelectedProjectId(projectId);

    if (projectId) {
      await loadDatasets(Number(projectId));
    } else {
      setDatasets([]);
    }
  }

  async function handleCreateDataset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProjectId) {
      setError("Please select a project first");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const dataset = await createDataset({
        project_id: Number(selectedProjectId),
        input_text: inputText,
        expected_output: expectedOutput,
        category,
        difficulty,
      });

      setDatasets((prev) => [dataset, ...prev]);

      setInputText("");
      setExpectedOutput("");
      setCategory("");
      setDifficulty("easy");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create dataset");
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteDataset(datasetId: number) {
    setError("");

    try {
      await deleteDataset(datasetId);
      setDatasets((prev) => prev.filter((dataset) => dataset.id !== datasetId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete dataset");
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
            <h1 className="text-3xl font-bold">Datasets</h1>
            <p className="mt-2 text-slate-400">
              Create test cases for evaluating LLM outputs.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/projects")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Projects
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
              Create a project first before adding datasets.
            </p>

            <button
              onClick={() => router.push("/projects")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Create Project
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={handleCreateDataset}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-xl font-semibold">Create dataset item</h2>

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
                <label className="text-sm text-slate-300">Input text</label>
                <textarea
                  className="mt-2 min-h-28 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Explain Kubernetes in simple words."
                  value={inputText}
                  onChange={(event) => setInputText(event.target.value)}
                  required
                />
              </div>

              <div className="mt-5">
                <label className="text-sm text-slate-300">
                  Expected output
                </label>
                <textarea
                  className="mt-2 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="Kubernetes is a platform for running and managing containers."
                  value={expectedOutput}
                  onChange={(event) => setExpectedOutput(event.target.value)}
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-300">Category</label>
                  <input
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    placeholder="technical"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Difficulty</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                  >
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
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
                {creating ? "Creating..." : "Create dataset item"}
              </button>
            </form>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Dataset items</h2>

              {datasets.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                  <p className="text-slate-300">No dataset items yet.</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Add your first LLM evaluation test case.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {datasets.map((dataset) => (
                    <div
                      key={dataset.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-blue-300">
                            Input
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            {dataset.input_text}
                          </p>

                          {dataset.expected_output && (
                            <>
                              <p className="mt-4 text-sm font-semibold text-green-300">
                                Expected output
                              </p>
                              <p className="mt-2 text-sm text-slate-400">
                                {dataset.expected_output}
                              </p>
                            </>
                          )}

                          <div className="mt-4 flex flex-wrap gap-2 text-xs">
                            {dataset.category && (
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                                {dataset.category}
                              </span>
                            )}

                            {dataset.difficulty && (
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                                {dataset.difficulty}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteDataset(dataset.id)}
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