"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dataset,
  Evaluation,
  Project,
  Prompt,
  deleteEvaluation,
  getDatasetsByProject,
  getEvaluationsByProject,
  getProjects,
  getPromptsByProject,
  runEvaluation,
} from "@/lib/api";

const getScoreLabel = (score: number) => {
  if (score >= 0.85) return "Excellent";
  if (score >= 0.65) return "Good";
  if (score >= 0.45) return "Weak";
  return "Poor";
};

const getScoreBadgeClass = (score: number) => {
  if (score >= 0.85) {
    return "bg-green-100 text-green-800 border-green-200";
  }

  if (score >= 0.65) {
    return "bg-blue-100 text-blue-800 border-blue-200";
  }

  if (score >= 0.45) {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  return "bg-red-100 text-red-800 border-red-200";
};

const getProviderLabel = (modelName?: string | null) => {
  if (!modelName) {
    return "Unknown";
  }

  if (modelName === "mock-fallback") {
    return "Mock Fallback";
  }

  if (modelName.toLowerCase().startsWith("gemini")) {
    return "Gemini";
  }

  return modelName;
};

const getProviderBadgeClass = (modelName?: string | null) => {
  if (!modelName) {
    return "bg-slate-100 text-slate-800 border-slate-200";
  }

  if (modelName === "mock-fallback") {
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  }

  if (modelName.toLowerCase().startsWith("gemini")) {
    return "bg-green-100 text-green-800 border-green-200";
  }

  return "bg-slate-100 text-slate-800 border-slate-200";
};

export default function EvaluationsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedPromptId, setSelectedPromptId] = useState("");

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");

  async function loadProjects() {
    setError("");

    try {
      const token = localStorage.getItem("trustops_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const projectData = await getProjects();
      setProjects(projectData);

      if (projectData.length > 0) {
        const firstProjectId = projectData[0].id;
        setSelectedProjectId(String(firstProjectId));
        await loadProjectData(firstProjectId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  async function loadProjectData(projectId: number) {
    setError("");

    try {
      const [datasetData, promptData, evaluationData] = await Promise.all([
        getDatasetsByProject(projectId),
        getPromptsByProject(projectId),
        getEvaluationsByProject(projectId),
      ]);

      setDatasets(datasetData);
      setPrompts(promptData);
      setEvaluations(evaluationData);

      setSelectedDatasetId(
        datasetData.length > 0 ? String(datasetData[0].id) : ""
      );
      setSelectedPromptId(promptData.length > 0 ? String(promptData[0].id) : "");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load project data"
      );
    }
  }

  async function handleProjectChange(projectId: string) {
    setSelectedProjectId(projectId);

    if (!projectId) {
      setDatasets([]);
      setPrompts([]);
      setEvaluations([]);
      setSelectedDatasetId("");
      setSelectedPromptId("");
      return;
    }

    await loadProjectData(Number(projectId));
  }

  async function handleRunEvaluation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProjectId || !selectedDatasetId || !selectedPromptId) {
      setError("Please select a project, dataset, and prompt first.");
      return;
    }

    setRunning(true);
    setError("");

    try {
      const evaluation = await runEvaluation({
        project_id: Number(selectedProjectId),
        dataset_id: Number(selectedDatasetId),
        prompt_id: Number(selectedPromptId),
      });

      setEvaluations((prev) => [evaluation, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run evaluation");
    } finally {
      setRunning(false);
    }
  }

  async function handleDeleteEvaluation(evaluationId: number) {
    setError("");

    try {
      await deleteEvaluation(evaluationId);
      setEvaluations((prev) =>
        prev.filter((evaluation) => evaluation.id !== evaluationId)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete evaluation"
      );
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
            <h1 className="text-3xl font-bold">Evaluations</h1>
            <p className="mt-2 text-slate-400">
              Run LLM evaluations by combining projects, datasets, and prompts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/datasets")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Datasets
            </button>

            <button
              onClick={() => router.push("/prompts")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Prompts
            </button>

            <button
              onClick={() => router.push("/reports")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Reports
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
              Create a project first before running evaluations.
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
              onSubmit={handleRunEvaluation}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <h2 className="text-xl font-semibold">Run evaluation</h2>

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
                <label className="text-sm text-slate-300">Dataset item</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  value={selectedDatasetId}
                  onChange={(event) => setSelectedDatasetId(event.target.value)}
                  required
                >
                  {datasets.length === 0 ? (
                    <option value="">No dataset available</option>
                  ) : (
                    datasets.map((dataset) => (
                      <option key={dataset.id} value={dataset.id}>
                        {dataset.input_text.slice(0, 80)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="mt-5">
                <label className="text-sm text-slate-300">Prompt</label>
                <select
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  value={selectedPromptId}
                  onChange={(event) => setSelectedPromptId(event.target.value)}
                  required
                >
                  {prompts.length === 0 ? (
                    <option value="">No prompt available</option>
                  ) : (
                    prompts.map((prompt) => (
                      <option key={prompt.id} value={prompt.id}>
                        {prompt.name} — {prompt.version}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {datasets.length === 0 && (
                <button
                  type="button"
                  onClick={() => router.push("/datasets")}
                  className="mt-6 w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200 hover:bg-slate-800"
                >
                  Create dataset first
                </button>
              )}

              {prompts.length === 0 && (
                <button
                  type="button"
                  onClick={() => router.push("/prompts")}
                  className="mt-4 w-full rounded-xl border border-slate-700 px-4 py-3 font-semibold text-slate-200 hover:bg-slate-800"
                >
                  Create prompt first
                </button>
              )}

              <button
                type="submit"
                disabled={running || datasets.length === 0 || prompts.length === 0}
                className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {running ? "Running evaluation..." : "Run evaluation"}
              </button>
            </form>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Evaluation results</h2>

              {evaluations.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">
                  <p className="text-slate-300">No evaluations yet.</p>
                  <p className="mt-2 text-sm text-slate-500">
                    Run your first evaluation using a dataset and prompt.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {evaluations.map((evaluation) => (
                    <div
                      key={evaluation.id}
                      className="rounded-xl border border-slate-800 bg-slate-950 p-5 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                          {evaluation.status}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getScoreBadgeClass(
                            Number(evaluation.score)
                          )}`}
                        >
                          {getScoreLabel(Number(evaluation.score))}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${getProviderBadgeClass(
                            evaluation.model_name
                          )}`}
                        >
                          {getProviderLabel(evaluation.model_name)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                          <p className="text-xs text-slate-500">Score</p>
                          <p className="text-lg font-semibold text-white">
                            {Number(evaluation.score).toFixed(2)} / 1.00
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                          <p className="text-xs text-slate-500">Latency</p>
                          <p className="text-lg font-semibold text-white">
                            {Number(evaluation.latency_ms).toFixed(2)} ms
                          </p>
                        </div>

                        <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                          <p className="text-xs text-slate-500">Model</p>
                          <p className="text-sm font-semibold text-white">
                            {evaluation.model_name || "Unknown"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>Evaluation Score</span>
                          <span>
                            {Math.round(Number(evaluation.score) * 100)}%
                          </span>
                        </div>

                        <div className="h-2 w-full rounded-full bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{
                              width: `${Math.min(
                                Number(evaluation.score) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 space-y-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Input
                          </p>
                          <p className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200">
                            {evaluation.input_text}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Expected output
                          </p>
                          <p className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200">
                            {evaluation.expected_output ||
                              "No expected output provided."}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            Generated output
                          </p>
                          <p className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200">
                            {evaluation.generated_output}
                          </p>
                        </div>

                        {evaluation.notes && (
                          <div className="rounded-lg border border-blue-900 bg-blue-950/40 p-3 text-sm text-blue-200">
                            {evaluation.notes}
                          </div>
                        )}

                        <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-slate-500">
                            Created:{" "}
                            {evaluation.created_at
                              ? new Date(
                                  evaluation.created_at
                                ).toLocaleString()
                              : "Unknown"}
                          </p>

                          <button
                            onClick={() =>
                              handleDeleteEvaluation(evaluation.id)
                            }
                            className="rounded-lg border border-red-900 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-950"
                          >
                            Delete
                          </button>
                        </div>
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