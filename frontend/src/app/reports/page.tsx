"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardReport, getDashboardReport } from "@/lib/api";

export default function ReportsPage() {
  const router = useRouter();

  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReport() {
    setError("");

    try {
      const token = localStorage.getItem("trustops_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await getDashboardReport();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Reports</h1>
            <p className="mt-2 text-slate-400">
              Analyze your TrustOps AI evaluation performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/evaluations")}
              className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
            >
              Evaluations
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
          <p className="mt-8 text-slate-400">Loading report...</p>
        ) : error ? (
          <div className="mt-8 rounded-xl border border-red-800 bg-red-950 p-4 text-red-200">
            {error}
          </div>
        ) : !report ? (
          <p className="mt-8 text-slate-400">No report data found.</p>
        ) : (
          <div className="mt-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ReportCard
                title="Projects"
                value={report.projects_count}
                description="Total AI evaluation projects"
              />

              <ReportCard
                title="Datasets"
                value={report.datasets_count}
                description="Total dataset items created"
              />

              <ReportCard
                title="Prompts"
                value={report.prompts_count}
                description="Total prompt templates"
              />

              <ReportCard
                title="Evaluations"
                value={report.evaluations_count}
                description="Total evaluation runs"
              />

              <ReportCard
                title="Average Score"
                value={Number(report.average_score || 0).toFixed(2)}
                description="Average output quality score"
              />

              <ReportCard
                title="Average Latency"
                value={`${Number(report.average_latency || 0).toFixed(2)} ms`}
                description="Average LLM response time"
              />
            </div>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Report Summary</h2>

              <p className="mt-4 text-slate-300">
                TrustOps AI has evaluated {report.evaluations_count} LLM
                responses across {report.projects_count} project(s). The current
                average evaluation score is{" "}
                <span className="font-semibold text-white">
                  {Number(report.average_score || 0).toFixed(2)}
                </span>{" "}
                with an average latency of{" "}
                <span className="font-semibold text-white">
                  {Number(report.average_latency || 0).toFixed(2)} ms
                </span>
                .
              </p>

              <div className="mt-5 rounded-xl border border-blue-900 bg-blue-950/40 p-4 text-sm text-blue-200">
                This report helps teams understand the quality, speed, and
                reliability of their LLM application before deploying it to real
                users.
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function ReportCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}