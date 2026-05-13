"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getReportSummary, type ReportSummary } from "@/lib/api";

const emptySummary: ReportSummary = {
  projects: 0,
  datasets: 0,
  prompts: 0,
  evaluations: 0,
  average_score: 0,
  average_latency_ms: 0,
};

export default function DashboardPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState<ReportSummary>(emptySummary);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("trustops_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const data = await getReportSummary();
        setSummary(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to load dashboard summary");
        }
      } finally {
        setReady(true);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("trustops_token");
    router.push("/login");
  }

  const cards = [
    {
      title: "Projects",
      description: "AI evaluation projects.",
      value: summary.projects,
    },
    {
      title: "Datasets",
      description: "LLM test cases.",
      value: summary.datasets,
    },
    {
      title: "Prompts",
      description: "Prompt versions.",
      value: summary.prompts,
    },
    {
      title: "Evaluations",
      description: "Completed evaluation runs.",
      value: summary.evaluations,
    },
    {
      title: "Average Score",
      description: "Average evaluation quality score.",
      value: `${Math.round(summary.average_score * 100)}%`,
    },
    {
      title: "Avg Latency",
      description: "Average mock response latency.",
      value: `${summary.average_latency_ms} ms`,
    },
  ];

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Projects", href: "/projects" },
    { label: "Datasets", href: "/datasets" },
    { label: "Prompts", href: "/prompts" },
    { label: "Evaluations", href: "/evaluations" },
  ];

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-800 bg-slate-900 p-6 md:block">
          <h1 className="text-2xl font-bold">TrustOps AI</h1>

          <p className="mt-2 text-sm text-slate-400">
            AI evaluation platform
          </p>

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block w-full rounded-xl px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section className="flex-1 p-6 md:p-10">
          <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-3xl font-bold">Dashboard</h2>

              <p className="mt-2 text-slate-400">
                Monitor your AI systems, prompts, datasets, and evaluations.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Manage Projects
              </Link>

              <Link
                href="/datasets"
                className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Manage Datasets
              </Link>

              <Link
                href="/prompts"
                className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Manage Prompts
              </Link>

              <Link
                href="/evaluations"
                className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Manage Evaluations
              </Link>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                Logout
              </button>
            </div>
          </header>

          {error && (
            <div className="mt-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
              >
                <p className="text-sm text-slate-400">{card.title}</p>

                <h3 className="mt-4 text-4xl font-bold">{card.value}</h3>

                <p className="mt-3 text-sm text-slate-400">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-semibold">TrustOps AI workflow</h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <h4 className="font-semibold">1. Create Project</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Start with an evaluation project for a specific AI use case.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <h4 className="font-semibold">2. Add Datasets</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Add test cases with input text and expected output.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <h4 className="font-semibold">3. Add Prompts</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Store prompt versions with model, temperature, and instructions.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
                <h4 className="font-semibold">4. Run Evaluations</h4>
                <p className="mt-2 text-sm text-slate-400">
                  Combine project, dataset, and prompt to produce evaluation results.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}