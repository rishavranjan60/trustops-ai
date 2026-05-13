import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-2 text-sm text-blue-300">
          Production AI / LLM / MLOps Evaluation Platform
        </div>

        <h1 className="mt-8 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Build trust in your AI systems with TrustOps AI
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-400">
          Evaluate prompts, monitor LLM outputs, track experiments, manage
          datasets, and prepare AI systems for production.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/register"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Get started
          </Link>

          <Link
            href="/login"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-200 hover:bg-slate-800"
          >
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}